<?php

// ============================================================
// ARKZEN ENGINE — AUTH BUILDER v2.14 (PER-TATEMONO)
// v2.14: optional social sign-in from @arkzen:oauth — {prefix}_oauth_accounts table,
//        a thin generated OAuthController (logic lives in Support/OAuthProviders),
//        and /auth/oauth/* routes. email + password keeps working untouched.
// v2.13: seedUsers() is now public and called as its own run() step
//        in ArkzenEngineController Phase 6.5 so seed failures surface
//        as a visible ✗ instead of being swallowed inside buildForTatemono.
// v2.12 (kept): seedUsers() seeds the tatemono's isolated users table
//        from auth_seed.users declared in @arkzen:meta. Passwords are
//        hashed via Hash::make(). Seeding is idempotent (updateOrInsert).
// v2.11 (kept): Notification infrastructure conditional on
//        @arkzen:notifications blocks.
// ============================================================

namespace App\Arkzen\Builders;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthBuilder
{
    public static function buildForTatemono(array $module): void
    {
        $name             = $module['name'];
        $dbConn           = ModelBuilder::slugToConnection($name);
        $slugNs           = EventBuilder::toNamespace($name);
        $prefix           = str_replace('-', '_', $name);
        $hasNotifications = !empty($module['notifications']);
        $oauth            = $module['oauth'] ?? null;
        $hasOAuth         = !empty($oauth['providers']);

        Log::info("[Arkzen Auth] Building isolated auth for: {$name} (notifications: " . ($hasNotifications ? 'yes' : 'no') . ")");

        MigrationBuilder::ensureDatabase($name, $dbConn);
        self::migrateAuthTables($dbConn, $prefix, $hasNotifications, $hasOAuth);
        self::generateUserModel($name, $slugNs, $dbConn, $prefix, $hasNotifications);
        self::generateTokenModel($name, $slugNs, $dbConn, $prefix);

        if ($hasNotifications) {
            self::generateNotificationModel($name, $slugNs, $dbConn, $prefix);
        }

        self::generateAuthController($name, $slugNs, $dbConn, $prefix);

        if ($hasOAuth) {
            self::generateOAuthController($name, $slugNs, $dbConn, $prefix, $oauth);
        } else {
            $stale = app_path("Http/Controllers/Arkzen/{$slugNs}/OAuthController.php");
            if (File::exists($stale)) File::delete($stale);
        }

        self::injectAuthRoutes($name, $slugNs, $hasOAuth);

        Log::info("[Arkzen Auth] ✓ Isolated auth complete for: {$name}");
    }

    // ─────────────────────────────────────────────
    // Called from ArkzenEngineController Phase 6.5
    // when a tatemono has auth + notifications but
    // no @arkzen:realtime blocks — ensures the private
    // notification channel is always registered in
    // channels.php regardless of realtime presence.
    // ─────────────────────────────────────────────
    public static function buildAuthChannel(array $module): void
    {
        if (empty($module['notifications'])) return;
        ChannelBuilder::buildAuthChannel($module);
    }

    // ─────────────────────────────────────────────
    // SEED USERS — v2.13 PUBLIC ENTRY POINT
    // Called as its own run() step in ArkzenEngineController
    // Phase 6.5 so failures are visible in the build log.
    // ─────────────────────────────────────────────

    public static function seedUsersForTatemono(array $module): void
    {
        if (empty($module['authSeed']['users'])) return;

        $name   = $module['name'];
        $dbConn = ModelBuilder::slugToConnection($name);
        $prefix = str_replace('-', '_', $name);

        self::seedUsers($dbConn, $prefix, $module['authSeed']['users']);
    }

    // ─────────────────────────────────────────────
    // SEED USERS — v2.12
    // Seeds the tatemono's isolated users table from
    // auth_seed.users declared in @arkzen:meta.
    // Idempotent: uses updateOrInsert keyed on email,
    // so rebuilding the tatemono won't duplicate users.
    // Passwords are hashed — never stored plain.
    // ─────────────────────────────────────────────

    public static function seedUsers(string $dbConn, string $prefix, array $users): void
    {
        $usersTable = "{$prefix}_users";

        foreach ($users as $user) {
            $email = $user['email'] ?? null;
            if (!$email) continue;

            DB::connection($dbConn)->table($usersTable)->updateOrInsert(
                ['email' => $email],
                [
                    'name'       => $user['name']     ?? $email,
                    'email'      => $email,
                    'password'   => Hash::make($user['password'] ?? 'password'),
                    'role'       => $user['role']     ?? 'user',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            Log::info("[Arkzen Auth] ✓ Seeded user: {$email} (role: " . ($user['role'] ?? 'user') . ")");
        }
    }

    private static function migrateAuthTables(string $dbConn, string $prefix, bool $hasNotifications, bool $hasOAuth = false): void
    {
        $usersTable  = "{$prefix}_users";
        $tokensTable = "{$prefix}_personal_access_tokens";

        if (!Schema::connection($dbConn)->hasTable($usersTable)) {
            Schema::connection($dbConn)->create($usersTable, function ($table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->timestamp('email_verified_at')->nullable();
                $table->string('password');
                $table->string('role', 20)->default('user');
                $table->rememberToken();
                $table->timestamps();
            });
            Log::info("[Arkzen Auth] ✓ Created table: {$usersTable}");
        }

        if (!Schema::connection($dbConn)->hasColumn($usersTable, 'role')) {
            Schema::connection($dbConn)->table($usersTable, function ($table) {
                $table->string('role', 20)->default('user')->after('password');
            });
            Log::info("[Arkzen Auth] ✓ Added `role` column to: {$usersTable}");
        }

        if (!Schema::connection($dbConn)->hasTable($tokensTable)) {
            Schema::connection($dbConn)->create($tokensTable, function ($table) {
                $table->id();
                $table->morphs('tokenable');
                $table->string('name');
                $table->string('token', 64)->unique();
                $table->text('abilities')->nullable();
                $table->timestamp('last_used_at')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();
            });
            Log::info("[Arkzen Auth] ✓ Created table: {$tokensTable}");
        }

        // OAuth identities — only when @arkzen:oauth is declared.
        // One user can link several providers; (provider, provider_user_id) identifies the external identity.
        if ($hasOAuth) {
            $accountsTable = "{$prefix}_oauth_accounts";
            if (!Schema::connection($dbConn)->hasTable($accountsTable)) {
                Schema::connection($dbConn)->create($accountsTable, function ($table) {
                    $table->id();
                    $table->unsignedBigInteger('user_id')->index();
                    $table->string('provider', 32);
                    $table->string('provider_user_id', 191);
                    $table->string('email')->nullable();
                    $table->text('avatar')->nullable();
                    $table->timestamps();
                    $table->unique(['provider', 'provider_user_id']);
                });
                Log::info("[Arkzen Auth] ✓ Created table: {$accountsTable}");
            }
        }

        // Notifications table — only when @arkzen:notifications is declared
        if ($hasNotifications) {
            $notificationsTable = "{$prefix}_notifications";
            if (!Schema::connection($dbConn)->hasTable($notificationsTable)) {
                Schema::connection($dbConn)->create($notificationsTable, function ($table) {
                    $table->uuid('id')->primary();
                    $table->string('type');
                    $table->morphs('notifiable');
                    $table->text('data');
                    $table->timestamp('read_at')->nullable();
                    $table->timestamps();
                });
                Log::info("[Arkzen Auth] ✓ Created table: {$notificationsTable}");
            }
        }
    }

    private static function generateUserModel(string $tatSlug, string $slugNs, string $dbConn, string $prefix, bool $hasNotifications): void
    {
        $usersTable = "{$prefix}_users";
        $path       = app_path("Models/Arkzen/{$slugNs}/User.php");

        // Always regenerate — DSL may have toggled notifications on/off
        File::ensureDirectoryExists(app_path("Models/Arkzen/{$slugNs}"));

        if ($hasNotifications) {
            $content = "<?php\n\n"
                . "// ============================================================\n"
                . "// ARKZEN GENERATED USER MODEL — {$tatSlug}\n"
                . "// Isolated to: database/arkzen/{$tatSlug}.sqlite\n"
                . "// Notifications: ENABLED (Notifiable trait + relations)\n"
                . "// DO NOT EDIT DIRECTLY.\n"
                . "// ============================================================\n\n"
                . "namespace App\\Models\\Arkzen\\{$slugNs};\n\n"
                . "use Illuminate\\Foundation\\Auth\\User as Authenticatable;\n"
                . "use Illuminate\\Notifications\\Notifiable;\n"
                . "use Laravel\\Sanctum\\HasApiTokens;\n"
                . "use Illuminate\\Database\\Eloquent\\Relations\\Relation;\n"
                . "use App\\Models\\Arkzen\\{$slugNs}\\DatabaseNotification;\n\n"
                . "Relation::morphMap([\n"
                . "    'notifiable' => DatabaseNotification::class,\n"
                . "]);\n\n"
                . "class User extends Authenticatable\n{\n"
                . "    use HasApiTokens, Notifiable;\n\n"
                . "    protected \$connection = '{$dbConn}';\n\n"
                . "    protected \$table = '{$usersTable}';\n\n"
                . "    protected \$fillable = ['name', 'email', 'password', 'role'];\n\n"
                . "    protected \$hidden = ['password', 'remember_token'];\n\n"
                . "    protected \$casts = [\n"
                . "        'email_verified_at' => 'datetime',\n"
                . "        'password'          => 'hashed',\n"
                . "    ];\n\n"
                . "    public function tokens()\n    {\n"
                . "        return \$this->morphMany(PersonalAccessToken::class, 'tokenable');\n"
                . "    }\n\n"
                . "    public function notifications()\n    {\n"
                . "        return \$this->morphMany(DatabaseNotification::class, 'notifiable')\n"
                . "            ->orderBy('created_at', 'desc');\n"
                . "    }\n\n"
                . "    public function unreadNotifications()\n    {\n"
                . "        return \$this->notifications()->whereNull('read_at');\n"
                . "    }\n"
                . "}\n";
        } else {
            // Lean model — no Notifiable, no notification relations, no unused imports
            $content = "<?php\n\n"
                . "// ============================================================\n"
                . "// ARKZEN GENERATED USER MODEL — {$tatSlug}\n"
                . "// Isolated to: database/arkzen/{$tatSlug}.sqlite\n"
                . "// Notifications: DISABLED (no @arkzen:notifications declared)\n"
                . "// DO NOT EDIT DIRECTLY.\n"
                . "// ============================================================\n\n"
                . "namespace App\\Models\\Arkzen\\{$slugNs};\n\n"
                . "use Illuminate\\Foundation\\Auth\\User as Authenticatable;\n"
                . "use Laravel\\Sanctum\\HasApiTokens;\n\n"
                . "class User extends Authenticatable\n{\n"
                . "    use HasApiTokens;\n\n"
                . "    protected \$connection = '{$dbConn}';\n\n"
                . "    protected \$table = '{$usersTable}';\n\n"
                . "    protected \$fillable = ['name', 'email', 'password', 'role'];\n\n"
                . "    protected \$hidden = ['password', 'remember_token'];\n\n"
                . "    protected \$casts = [\n"
                . "        'email_verified_at' => 'datetime',\n"
                . "        'password'          => 'hashed',\n"
                . "    ];\n\n"
                . "    public function tokens()\n    {\n"
                . "        return \$this->morphMany(PersonalAccessToken::class, 'tokenable');\n"
                . "    }\n"
                . "}\n";
        }

        File::put($path, $content);
        Log::info("[Arkzen Auth] ✓ User model written: Models/Arkzen/{$slugNs}/User.php (notifications: " . ($hasNotifications ? 'yes' : 'no') . ")");
    }

    private static function generateTokenModel(string $tatSlug, string $slugNs, string $dbConn, string $prefix): void
    {
        $tokensTable = "{$prefix}_personal_access_tokens";
        $path        = app_path("Models/Arkzen/{$slugNs}/PersonalAccessToken.php");

        if (File::exists($path)) {
            Log::info("[Arkzen Auth] ✓ PersonalAccessToken model already exists for: {$tatSlug}");
            return;
        }

        $content = "<?php\n\n"
            . "// ============================================================\n"
            . "// ARKZEN GENERATED PERSONAL ACCESS TOKEN MODEL — {$tatSlug}\n"
            . "// Isolated to: database/arkzen/{$tatSlug}.sqlite\n"
            . "// DO NOT EDIT DIRECTLY.\n"
            . "// ============================================================\n\n"
            . "namespace App\\Models\\Arkzen\\{$slugNs};\n\n"
            . "use Laravel\\Sanctum\\PersonalAccessToken as SanctumToken;\n\n"
            . "class PersonalAccessToken extends SanctumToken\n{\n"
            . "    protected \$connection = '{$dbConn}';\n"
            . "    protected \$table      = '{$tokensTable}';\n"
            . "}\n";

        File::put($path, $content);
        Log::info("[Arkzen Auth] ✓ PersonalAccessToken model created for: {$tatSlug}");
    }

    private static function generateNotificationModel(string $tatSlug, string $slugNs, string $dbConn, string $prefix): void
    {
        $notificationsTable = "{$prefix}_notifications";
        $path               = app_path("Models/Arkzen/{$slugNs}/DatabaseNotification.php");

        if (File::exists($path)) {
            Log::info("[Arkzen Auth] ✓ DatabaseNotification model already exists for: {$tatSlug}");
            return;
        }

        $content = "<?php\n\n"
            . "// ============================================================\n"
            . "// ARKZEN GENERATED DATABASE NOTIFICATION MODEL — {$tatSlug}\n"
            . "// Isolated to: database/arkzen/{$tatSlug}.sqlite\n"
            . "// DO NOT EDIT DIRECTLY.\n"
            . "// ============================================================\n\n"
            . "namespace App\\Models\\Arkzen\\{$slugNs};\n\n"
            . "use Illuminate\\Notifications\\DatabaseNotification as BaseDatabaseNotification;\n\n"
            . "class DatabaseNotification extends BaseDatabaseNotification\n{\n"
            . "    protected \$connection = '{$dbConn}';\n"
            . "    protected \$table      = '{$notificationsTable}';\n\n"
            . "    protected static function boot()\n    {\n"
            . "        parent::boot();\n\n"
            . "        static::creating(function (\$model) {\n"
            . "            if (empty(\$model->type)) {\n"
            . "                \$model->type = 'notifiable';\n"
            . "            }\n"
            . "        });\n"
            . "    }\n"
            . "}\n";

        File::put($path, $content);
        Log::info("[Arkzen Auth] ✓ DatabaseNotification model created: Models/Arkzen/{$slugNs}/DatabaseNotification.php");
    }

    private static function generateAuthController(string $tatSlug, string $slugNs, string $dbConn, string $prefix): void
    {
        $path = app_path("Http/Controllers/Arkzen/{$slugNs}/AuthController.php");

        if (File::exists($path)) {
            Log::info("[Arkzen Auth] ✓ AuthController already exists for: {$tatSlug}");
            return;
        }

        File::ensureDirectoryExists(app_path("Http/Controllers/Arkzen/{$slugNs}"));

        $content = "<?php\n\n"
            . "// ============================================================\n"
            . "// ARKZEN GENERATED AUTH CONTROLLER — {$tatSlug}\n"
            . "// Isolated auth: users live in database/arkzen/{$tatSlug}.sqlite\n"
            . "// DO NOT EDIT DIRECTLY.\n"
            . "// ============================================================\n\n"
            . "namespace App\\Http\\Controllers\\Arkzen\\{$slugNs};\n\n"
            . "use Illuminate\\Routing\\Controller;\n"
            . "use Illuminate\\Http\\Request;\n"
            . "use Illuminate\\Http\\JsonResponse;\n"
            . "use Illuminate\\Support\\Facades\\Hash;\n"
            . "use Illuminate\\Validation\\ValidationException;\n"
            . "use App\\Models\\Arkzen\\{$slugNs}\\User;\n\n"
            . "class AuthController extends Controller\n{\n"
            . "    public function register(Request \$request): JsonResponse\n    {\n"
            . "        \$validated = \$request->validate([\n"
            . "            'name'     => 'required|string|max:255',\n"
            . "            'email'    => 'required|email|unique:App\\\\Models\\\\Arkzen\\\\{$slugNs}\\\\User,email',\n"
            . "            'password' => 'required|string|min:8|confirmed',\n"
            . "        ]);\n\n"
            . "        \$user = User::create([\n"
            . "            'name'     => \$validated['name'],\n"
            . "            'email'    => \$validated['email'],\n"
            . "            'password' => Hash::make(\$validated['password']),\n"
            . "        ]);\n\n"
            . "        \$token = \$user->createToken('arkzen-token')->plainTextToken;\n\n"
            . "        return response()->json(['user' => \$user, 'token' => \$token], 201);\n"
            . "    }\n\n"
            . "    public function login(Request \$request): JsonResponse\n    {\n"
            . "        \$validated = \$request->validate([\n"
            . "            'email'    => 'required|email',\n"
            . "            'password' => 'required|string',\n"
            . "        ]);\n\n"
            . "        \$user = User::where('email', \$validated['email'])->first();\n\n"
            . "        if (!\$user || !Hash::check(\$validated['password'], \$user->password)) {\n"
            . "            throw ValidationException::withMessages([\n"
            . "                'email' => ['The provided credentials are incorrect.'],\n"
            . "            ]);\n"
            . "        }\n\n"
            . "        \$user->tokens()->delete();\n"
            . "        \$token = \$user->createToken('arkzen-token')->plainTextToken;\n\n"
            . "        return response()->json(['user' => \$user, 'token' => \$token]);\n"
            . "    }\n\n"
            . "    public function logout(Request \$request): JsonResponse\n    {\n"
            . "        \$request->user()->currentAccessToken()->delete();\n"
            . "        return response()->json(['message' => 'Logged out successfully']);\n"
            . "    }\n\n"
            . "    public function me(Request \$request): JsonResponse\n    {\n"
            . "        return response()->json(\$request->user());\n"
            . "    }\n"
            . "}\n";

        File::put($path, $content);
        Log::info("[Arkzen Auth] ✓ AuthController created: Http/Controllers/Arkzen/{$slugNs}/AuthController.php");
    }

    // ─────────────────────────────────────────────
    // OAUTH CONTROLLER (v2.14)
    // Thin by design: provider endpoints, state, PKCE and the Apple JWT live in
    // App\Arkzen\Support\OAuthProviders. This file only links the identity to
    // this tatemono's isolated users table. Always regenerated so the provider
    // list and redirects follow the DSL.
    // ─────────────────────────────────────────────
    private static function generateOAuthController(string $tatSlug, string $slugNs, string $dbConn, string $prefix, array $oauth): void
    {
        $path = app_path("Http/Controllers/Arkzen/{$slugNs}/OAuthController.php");
        File::ensureDirectoryExists(app_path("Http/Controllers/Arkzen/{$slugNs}"));

        $template = <<<'PHPTPL'
<?php

// ============================================================
// ARKZEN GENERATED OAUTH CONTROLLER — __SLUG__
// Social sign-in layered on the isolated auth. DO NOT EDIT DIRECTLY.
// ============================================================

namespace App\Http\Controllers\Arkzen\__NS__;

use App\Arkzen\Support\OAuthProviders;
use App\Models\Arkzen\__NS__\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class OAuthController extends Controller
{
    private const SLUG           = '__SLUG__';
    private const CONN           = '__CONN__';
    private const PREFIX         = '__PREFIX__';
    private const PROVIDERS      = __PROVIDERS__;
    private const REDIRECT       = '__REDIRECT__';
    private const ERROR_REDIRECT = '__ERROR_REDIRECT__';
    private const LINK_VERIFIED  = __LINK__;

    private function oauth(): OAuthProviders
    {
        $http = function (string $method, string $url, array $headers, ?string $body): array {
            $req = Http::withHeaders($headers)->timeout(15);
            $res = $method === 'POST'
                ? $req->withBody((string) $body, $headers['Content-Type'] ?? 'application/x-www-form-urlencoded')->post($url)
                : $req->get($url);
            return [$res->status(), $res->body()];
        };
        return new OAuthProviders($http, fn (string $k, string $d = '') => (string) config('arkzen_oauth.' . $k, $d));
    }

    private function go(string $url, ?string $cookie = null): Response
    {
        $r = redirect()->away($url)->header('Cache-Control', 'no-store');
        return $cookie ? $r->header('Set-Cookie', $cookie) : $r;
    }

    private function fail(OAuthProviders $o, string $provider, string $message): Response
    {
        return $this->go(
            $o->frontendUrl() . self::ERROR_REDIRECT . '#' . http_build_query(['arkzen_oauth_error' => $message]),
            OAuthProviders::clearStateCookie(self::SLUG, $provider)
        );
    }

    public function providers(): JsonResponse
    {
        $o = $this->oauth();
        return response()->json(['providers' => array_map(fn ($id) => [
            'id' => $id, 'name' => OAuthProviders::NAMES[$id], 'enabled' => $o->isConfigured($id),
        ], self::PROVIDERS)]);
    }

    public function redirect(string $provider): Response
    {
        if (!in_array($provider, self::PROVIDERS, true)) {
            return response()->json(['message' => 'Unknown OAuth provider.'], 404);
        }
        $o = $this->oauth();
        if (!$o->isConfigured($provider)) {
            return $this->fail($o, $provider, OAuthProviders::NAMES[$provider] . ' sign-in is not configured on this server.');
        }
        [$url, $nonce] = $o->authorizeUrl(self::SLUG, $provider);
        return $this->go($url, OAuthProviders::stateCookie(self::SLUG, $nonce, $provider));
    }

    public function callback(Request $request, string $provider): Response
    {
        if (!in_array($provider, self::PROVIDERS, true)) {
            return response()->json(['message' => 'Unknown OAuth provider.'], 404);
        }
        $o = $this->oauth();
        try {
            if ($request->input('error')) {
                return $this->fail($o, $provider, OAuthProviders::NAMES[$provider] . ' sign-in was cancelled or denied.');
            }
            $st = $o->readState((string) $request->input('state', ''));
            $cookieNonce = $request->cookies->get(OAuthProviders::stateCookieName(self::SLUG));
            if (!$st || ($st['p'] ?? '') !== $provider || ($st['s'] ?? '') !== self::SLUG
                || !is_string($cookieNonce) || $cookieNonce === '' || !hash_equals($cookieNonce, (string) ($st['n'] ?? ''))) {
                return $this->fail($o, $provider, 'Sign-in session expired or was tampered with. Please try again.');
            }
            $code = $request->input('code');
            if (!is_string($code) || $code === '') {
                return $this->fail($o, $provider, 'The provider did not return an authorization code.');
            }

            $tokens  = $o->exchangeCode(self::SLUG, $provider, $code, $st['n']);
            $appleUser = $request->input('user');
            $profile = $o->profile($provider, $tokens, ['nonce' => $st['n'], 'apple_user' => is_string($appleUser) ? $appleUser : null]);
            if ($profile['id'] === '') throw new \RuntimeException('Provider returned no user id');

            $user  = $this->resolveUser($provider, $profile);
            $token = $user->createToken('arkzen-token')->plainTextToken;
            return $this->go(
                $o->frontendUrl() . self::REDIRECT . '#' . http_build_query(['arkzen_oauth_token' => $token, 'arkzen_oauth_slug' => self::SLUG]),
                OAuthProviders::clearStateCookie(self::SLUG, $provider)
            );
        } catch (\Throwable $e) {
            Log::error("[oauth:{$provider}] " . $e->getMessage());
            return $this->fail($o, $provider, 'Sign-in failed. Please try again.');
        }
    }

    /** Finds, links or creates the local user for a provider profile. */
    private function resolveUser(string $provider, array $p): User
    {
        $db       = DB::connection(self::CONN);
        $accounts = self::PREFIX . '_oauth_accounts';
        $now      = now();

        return $db->transaction(function () use ($db, $accounts, $provider, $p, $now) {
            $linked = $db->table($accounts)->where('provider', $provider)->where('provider_user_id', $p['id'])->first();
            if ($linked) {
                $user = User::query()->find($linked->user_id);
                if ($user) {
                    $db->table($accounts)->where('id', $linked->id)->update(['email' => $p['email'], 'avatar' => $p['avatar'], 'updated_at' => $now]);
                    return $user;
                }
                $db->table($accounts)->where('id', $linked->id)->delete();   // orphaned link: re-create below
            }

            $email = $p['email'] ? strtolower($p['email']) : null;
            $user  = null;

            if ($email && $p['email_verified'] && self::LINK_VERIFIED) {
                $user = User::query()->whereRaw('lower(email) = ?', [$email])->first();
                if ($user) {
                    // Pre-hijack defence: this account may have been registered by someone else with this email before
                    // its owner ever signed in with the provider (the users table has no verified-email flag). Revoke
                    // every session and replace the password so only the provider-verified owner can continue.
                    $user->tokens()->delete();
                    $user->forceFill(['password' => Str::random(64)])->save();
                }
            }

            if (!$user) {
                // Providers without a usable email (Instagram, X without permission) get a reserved, non-routable address.
                $own = $email;
                if ($own && User::query()->whereRaw('lower(email) = ?', [$own])->exists()) $own = null;   // taken and not linkable
                $own  = $own ?: strtolower("{$provider}-{$p['id']}@oauth.invalid");
                $name = Str::limit($p['name'] ?: explode('@', $own)[0], 255, '');
                $user = new User();
                $user->forceFill([
                    'name' => $name, 'email' => $own, 'password' => Str::random(64), 'role' => 'user',
                    'email_verified_at' => $p['email_verified'] ? $now : null,
                ])->save();
            }

            $db->table($accounts)->insert([
                'user_id' => $user->id, 'provider' => $provider, 'provider_user_id' => $p['id'],
                'email' => $p['email'], 'avatar' => $p['avatar'], 'created_at' => $now, 'updated_at' => $now,
            ]);
            return $user;
        });
    }
}
PHPTPL;

        $asPath = fn ($v) => is_string($v) && str_starts_with($v, '/') && !str_starts_with($v, '//') ? $v : '/';
        $content = strtr($template, [
            '__SLUG__'           => $tatSlug,
            '__NS__'             => $slugNs,
            '__CONN__'           => $dbConn,
            '__PREFIX__'         => $prefix,
            '__PROVIDERS__'      => var_export(array_values($oauth['providers'] ?? []), true),
            '__REDIRECT__'       => addslashes($asPath($oauth['redirect'] ?? '/')),
            '__ERROR_REDIRECT__' => addslashes($asPath($oauth['errorRedirect'] ?? '/')),
            '__LINK__'           => (($oauth['linkVerifiedEmail'] ?? true) === false) ? 'false' : 'true',
        ]);

        File::put($path, $content);
        Log::info("[Arkzen Auth] ✓ OAuthController written: Http/Controllers/Arkzen/{$slugNs}/OAuthController.php");
    }

    // ============================================================
    // BROADCASTING AUTH CLOSURE (v2.10)
    // Signs "{socket_id}:{channel_name}" with REVERB_APP_SECRET
    // (HMAC-SHA256). User ID extracted via str_starts_with + substr.
    // ============================================================
    private static function broadcastingAuthClosure(string $tatSlug): string
    {
        // Builds the /broadcasting/auth route closure.
        //
        // Handles two channel types:
        //   private-{slug}.{userId}   → HMAC of "socketId:channelName"
        //   presence-{slug}-*         → HMAC of "socketId:channelName:channelData"
        //                               response also includes channel_data so Reverb
        //                               can track the member roster.
        //
        // Any other prefix is rejected with 403.
        return "    Route::post('/broadcasting/auth', function (\\Illuminate\\Http\\Request \$request) {\n"
            . "        \$user = \$request->user();\n"
            . "        if (!\$user) {\n"
            . "            return response()->json(['message' => 'Unauthenticated.'], 401);\n"
            . "        }\n"
            . "\n"
            . "        \$socketId    = \$request->input('socket_id');\n"
            . "        \$channelName = \$request->input('channel_name');\n"
            . "\n"
            . "        if (!\$socketId || !\$channelName) {\n"
            . "            return response()->json(['message' => 'Missing socket_id or channel_name.'], 422);\n"
            . "        }\n"
            . "\n"
            . "        \$secret = config('reverb.apps.apps.0.secret', env('REVERB_APP_SECRET'));\n"
            . "        \$appKey = config('reverb.apps.apps.0.key',    env('REVERB_APP_KEY'));\n"
            . "\n"
            . "        // ── Presence channel ──────────────────────────────────────────\n"
            . "        // Channel name: presence-{$tatSlug}-*\n"
            . "        // Reverb requires the HMAC to cover socketId:channelName:channelData\n"
            . "        // and the response must include channel_data for the member roster.\n"
            . "        if (str_starts_with(\$channelName, 'presence-{$tatSlug}')) {\n"
            . "            \$channelData = json_encode([\n"
            . "                'user_id'   => \$user->id,\n"
            . "                'user_info' => ['name' => \$user->name ?? \$user->email],\n"
            . "            ]);\n"
            . "            \$signature = hash_hmac('sha256', \"\$socketId:\$channelName:\$channelData\", \$secret);\n"
            . "            return response()->json([\n"
            . "                'auth'         => \"\$appKey:\$signature\",\n"
            . "                'channel_data' => \$channelData,\n"
            . "            ]);\n"
            . "        }\n"
            . "\n"
            . "        // ── Private channel ───────────────────────────────────────────\n"
            . "        // Channel name: private-{$tatSlug}.{userId}\n"
            . "        // Verify user owns the channel, then sign socketId:channelName.\n"
            . "        \$expectedPrefix = 'private-{$tatSlug}.';\n"
            . "        if (!str_starts_with(\$channelName, \$expectedPrefix)) {\n"
            . "            return response()->json(['message' => 'Invalid channel prefix.'], 403);\n"
            . "        }\n"
            . "\n"
            . "        \$channelUserId = (int) substr(\$channelName, strlen(\$expectedPrefix));\n"
            . "        if (\$channelUserId !== (int) \$user->id) {\n"
            . "            return response()->json(['message' => 'Forbidden.'], 403);\n"
            . "        }\n"
            . "\n"
            . "        \$signature = hash_hmac('sha256', \"\$socketId:\$channelName\", \$secret);\n"
            . "        return response()->json(['auth' => \"\$appKey:\$signature\"]);\n"
            . "    });\n";
    }
    private static function buildAuthBlock(string $tatSlug, string $slugNs, bool $hasOAuth = false): string
    {
        $authAlias        = "{$slugNs}Auth";
        $broadcastClosure = self::broadcastingAuthClosure($tatSlug);

        // Social sign-in routes (v2.14). Public: the browser is redirected here by the provider.
        $oauthRoutes = '';
        if ($hasOAuth) {
            $oauthAlias  = "{$slugNs}OAuthController";
            $oauthRoutes = "use App\\Http\\Controllers\\Arkzen\\{$slugNs}\\OAuthController as {$oauthAlias};\n\n"
                . "Route::middleware(['api'])->prefix('/api/{$tatSlug}/auth/oauth')->group(function () {\n"
                . "    Route::get('/providers', [{$oauthAlias}::class, 'providers']);\n"
                . "    Route::get('/{provider}/redirect', [{$oauthAlias}::class, 'redirect']);\n"
                . "    Route::match(['GET', 'POST'], '/{provider}/callback', [{$oauthAlias}::class, 'callback']);\n"
                . "});\n\n";
        }

        return "\n"
            . "// ── Auth routes — {$tatSlug} ──────────────────────────────────\n"
            . "use App\\Http\\Controllers\\Arkzen\\{$slugNs}\\AuthController as {$authAlias}Controller;\n\n"
            . $oauthRoutes
            . "Route::middleware(['api'])->prefix('/api/{$tatSlug}/auth')->group(function () {\n"
            . "    Route::post('/register', [{$authAlias}Controller::class, 'register']);\n"
            . "    Route::post('/login',    [{$authAlias}Controller::class, 'login']);\n"
            . "});\n\n"
            . "Route::middleware(['api', 'auth:sanctum'])->prefix('/api/{$tatSlug}/auth')->group(function () {\n"
            . "    Route::post('/logout', [{$authAlias}Controller::class, 'logout']);\n"
            . "    Route::get('/me',      [{$authAlias}Controller::class, 'me']);\n"
            . $broadcastClosure
            . "});\n"
            . "// ── End auth — {$tatSlug} ─────────────────────────────────────\n";
    }

    private static function injectAuthRoutes(string $tatSlug, string $slugNs, bool $hasOAuth = false): void
    {
        $routeFile   = base_path("routes/modules/{$tatSlug}.php");
        $authBlock   = self::buildAuthBlock($tatSlug, $slugNs, $hasOAuth);
        $authMarker  = "// ── Auth routes — {$tatSlug} ──";

        if (!File::exists($routeFile)) {
            $content = "<?php\n\n"
                . "// ============================================================\n"
                . "// ARKZEN GENERATED ROUTES — {$tatSlug}\n"
                . "// DO NOT EDIT DIRECTLY.\n"
                . "// ============================================================\n\n"
                . "use Illuminate\\Support\\Facades\\Route;\n"
                . $authBlock;
            File::ensureDirectoryExists(base_path('routes/modules'));
            File::put($routeFile, $content);
            Log::info("[Arkzen Auth] ✓ Auth routes injected into new route file: {$tatSlug}.php");
            return;
        }

        $existing = File::get($routeFile);

        // v2.9 PRE-PASS — strip stray Broadcast::auth() route groups
        if (str_contains($existing, 'Broadcast::auth(')) {
            $existing = preg_replace(
                '/\/\/ ── Broadcasting auth \(tatemono-scoped\).*?Route::middleware\([^\)]+\)\s*->post\([^;]+Broadcast::auth[^;]+;\s*/s',
                '',
                $existing
            );
            $existing = preg_replace(
                '/Route::middleware\(\[\'api\',\s*\'auth:sanctum\'\]\)\s*->post\(\s*[\'"]api\/' . preg_quote($tatSlug, '/') . '\/auth\/broadcasting\/auth[\'"]\s*,\s*function[^}]+Broadcast::auth[^}]+\}\s*\)\s*;\s*/s',
                '',
                $existing
            );
            Log::info("[Arkzen Auth] ✓ Stripped stray Broadcast::auth() route from {$tatSlug}.php");
        }

        // v2.10 HEAL old regex capture bug
        if (str_contains($existing, "preg_replace('/.*\\.([0-9]+)\$/', ''")) {
            $existing = str_replace(
                "preg_replace('/.*\\.([0-9]+)\$/', ''",
                "preg_replace('/.*\\.([0-9]+)\$/', '\\1'",
                $existing
            );
            Log::info("[Arkzen Auth] ✓ Healed regex capture bug in {$tatSlug}.php");
        }

        if (str_contains($existing, $authMarker)) {
            $needsHeal = str_contains($existing, 'Broadcast::auth(')
                || !str_contains($existing, "Route::post('/broadcasting/auth'")
                || str_contains($existing, "/api/{$tatSlug}/auth/oauth") !== $hasOAuth;   // v2.14: provider block toggled in the DSL

            if ($needsHeal) {
                $existing = preg_replace(
                    '/\/\/ ── Auth routes — ' . preg_quote($tatSlug, '/') . ' ──.*?\/\/ ── End auth — ' . preg_quote($tatSlug, '/') . ' ─+\n/s',
                    ltrim($authBlock),
                    $existing
                );
                File::put($routeFile, $existing);
                Log::info("[Arkzen Auth] ✓ Healed auth block in {$tatSlug}.php");
            } else {
                File::put($routeFile, $existing);
                Log::info("[Arkzen Auth] ✓ Auth block already canonical in {$tatSlug}.php");
            }
            return;
        }

        if (str_starts_with(trim($existing), '<?php')) {
            $existing = preg_replace('/^<\?php/', "<?php\n\n" . ltrim($authBlock), $existing);
        } else {
            $existing = "<?php\n\n" . ltrim($authBlock) . "\n" . $existing;
        }
        File::put($routeFile, $existing);
        Log::info("[Arkzen Auth] ✓ Auth routes added to existing route file: {$tatSlug}.php");
    }

    public static function removeForTatemono(string $tatSlug): void
    {
        $slugNs = EventBuilder::toNamespace($tatSlug);

        $filesToRemove = [
            app_path("Http/Controllers/Arkzen/{$slugNs}/AuthController.php"),
            app_path("Http/Controllers/Arkzen/{$slugNs}/OAuthController.php"),
            app_path("Models/Arkzen/{$slugNs}/User.php"),
            app_path("Models/Arkzen/{$slugNs}/PersonalAccessToken.php"),
            app_path("Models/Arkzen/{$slugNs}/DatabaseNotification.php"),
        ];

        foreach ($filesToRemove as $file) {
            if (File::exists($file)) {
                File::delete($file);
                Log::info("[Arkzen Auth] ✓ Removed: {$file}");
            }
        }

        Log::info("[Arkzen Auth] ✓ Auth artifacts removed for: {$tatSlug}");
    }
}
