<?php

namespace App\Http\Controllers\Arkzen\BodyMailNotification;

use Illuminate\Routing\Controller;
use App\Models\Arkzen\BodyMailNotification\SendLog;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SendLogController extends Controller
{
    /**
     * All send log entries for the authenticated user
     */
    public function index(Request $request): Response
    {
        $query = SendLog::query();


        $perPage = $request->get('per_page', 15);
        $items   = $query->paginate($perPage);

        return Inertia::render('BodyMailNotification/Index', [
            'items'   => $items,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    /**
     * Send a mail and write a log row — blade_body injection test
     */
    public function sendMail(Request $request): RedirectResponse
    {
$validated = $request->validate([
    'mail' => 'required|string|in:welcome,receipt,alert',
    'to'   => 'required|email',
]);
$user      = $request->user('sanctum');
$mailKey   = $validated['mail'];
$className = \Illuminate\Support\Str::studly(str_replace('-', '_', $mailKey)) . 'Mail';
$fullClass = "\\App\\Mail\\Arkzen\\BodyMailNotification\\" . $className;
if (!class_exists($fullClass)) {
    return response()->json(['message' => 'Unknown mail type: ' . $mailKey], 422);
}
// Provide default data for each mail type so the constructor is satisfied.
$mailData = match($mailKey) {
    'welcome' => ['Test User', 'Arkzen'],
    'receipt' => ['ORD-001', '$9.99', 'Arkzen Test Item'],
    'alert'   => ['This is a test alert from Arkzen.', url('/')],
    default   => [],
};
try {
    \Mail::to($validated['to'])->send(new $fullClass(...$mailData));
    $log = \App\Models\Arkzen\BodyMailNotification\SendLog::create([
        'user_id'    => $user?->id,
        'to_email'   => $validated['to'],
        'subject'    => $mailKey,
        'mail_class' => $fullClass,
        'kind'       => 'mail',
        'status'     => 'sent',
    ]);
    return response()->json($log, 201);
} catch (\Throwable $e) {
    $log = \App\Models\Arkzen\BodyMailNotification\SendLog::create([
        'user_id'    => $user?->id,
        'to_email'   => $validated['to'],
        'subject'    => $mailKey,
        'mail_class' => $fullClass,
        'kind'       => 'mail',
        'status'     => 'failed',
        'error'      => $e->getMessage(),
    ]);
    return response()->json($log, 201);
}
    }

    /**
     * Trigger a notification and write a log row — toMail_body injection test
     */
    public function notify(Request $request): RedirectResponse
    {
$validated = $request->validate([
    'notification' => 'required|string|in:action-required,summary',
    'message'      => 'sometimes|string|max:255',
]);
$user     = $request->user();
$notifKey = $validated['notification'];
$className = \Illuminate\Support\Str::studly(str_replace('-', '_', $notifKey)) . 'Notification';
$fullClass = "\\App\\Notifications\\Arkzen\\BodyMailNotification\\" . $className;
if (!class_exists($fullClass)) {
    return response()->json(['message' => 'Unknown notification type: ' . $notifKey], 422);
}
try {
    $instance = new $fullClass($user);
    if (isset($validated['message'])) {
        $instance->message = $validated['message'];
    }
    $user->notify($instance);
    $log = \App\Models\Arkzen\BodyMailNotification\SendLog::create([
        'user_id'    => $user?->id,
        'to_email'   => $user?->email,
        'subject'    => $notifKey,
        'mail_class' => $fullClass,
        'kind'       => 'notification',
        'status'     => 'sent',
    ]);
    return response()->json($log, 201);
} catch (\Throwable $e) {
    $log = \App\Models\Arkzen\BodyMailNotification\SendLog::create([
        'user_id'    => $user?->id,
        'to_email'   => $user?->email,
        'subject'    => $notifKey,
        'mail_class' => $fullClass,
        'kind'       => 'notification',
        'status'     => 'failed',
        'error'      => $e->getMessage(),
    ]);
    return response()->json($log, 201);
}
    }

    /**
     * Wipe all send log entries for this user
     */
    public function clearLog(Request $request): RedirectResponse
    {
$user = $request->user('sanctum');
\App\Models\Arkzen\BodyMailNotification\SendLog::where('user_id', $user?->id)->delete();
return response()->json(['message' => 'Log cleared']);
    }
}
