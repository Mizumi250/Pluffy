# Pluff — Expo Stack (v9.5)

## Status: Active — First Native Platform

The Expo stack is Pluff's **default mobile platform**.
Same tatemono DSL → Expo Go native output.
Same Laravel backend → API is completely shared.

---

## Architecture

```
Same tatemono DSL (@arkzen:native:*) → Expo Router screens + NativeWind
Same Laravel backend                 → API endpoints are identical
Same Sanctum auth                    → Token stored in SecureStore (not cookies)
```

---

## How to Run the Engine

```bash
cd engine/frontend/expo
npm install
npm run arkzen       # watches tatemonos/ and generates screens
```

In a separate terminal (from project root):

```bash
cd engine/frontend/expo
npx expo start       # opens Expo Go QR — scan from your phone
```

Or from project root alongside other services:
```bash
node start.js        # starts Laravel + Queue + Reverb + Expo concurrently
```

---

## File Structure

```
engine/frontend/expo/
├── arkzen.ts                              ← Entry point (tsx watch arkzen.ts)
├── arkzen/
│   ├── sync.ts                            ← Syncs shared core into this stack
│   ├── types/
│   │   └── index.ts                       ← Types (extends shared + Expo-specific)
│   ├── generated/                         ← Runtime — DO NOT EDIT
│   └── core/
│       ├── expo-builder.ts                ← Orchestrates tatemono builds
│       ├── expo-router.ts                 ← Generates screens + Expo Router files
│       ├── expo-registry.ts               ← Tracks active tatemonos (expo-registry.json)
│       ├── expo-watcher.ts                ← Watches tatemonos/ folder
│       └── adapters/
│           ├── router.ts                  ← expo-router adapter (useArkzenRouter)
│           └── Link.tsx                   ← expo-router Link adapter
│
├── app/                                   ← Expo Router file-based routes
│   ├── _layout.tsx                        ← Root layout (SafeAreaProvider, GestureHandler)
│   ├── index.tsx                          ← Root redirect to first tatemono
│   └── {tatName}/                         ← AUTO-GENERATED per tatemono
│       └── {screen}.tsx                   ← Thin re-export → src/screens/
│
├── src/
│   ├── screens/                           ← AUTO-GENERATED screen components
│   │   └── {tatName}/
│   │       └── {screen}.tsx
│   ├── layouts/
│   │   ├── AuthLayout.tsx                 ← Auth guard layout (NativeWind styled)
│   │   └── GuestLayout.tsx                ← Guest/login layout (NativeWind styled)
│   ├── hooks/
│   │   └── useArkzenExpoAuth.ts           ← Expo auth hook (SecureStore)
│   ├── components/                        ← Shared native components
│   └── arkzen/
│       └── generated/
│           └── routes.ts                  ← AUTO-GENERATED route registry
│
├── expo-registry.json                     ← AUTO-GENERATED tatemono registry
├── app.json                               ← Expo config
├── babel.config.js                        ← NativeWind v4 + Expo Router + Reanimated
├── metro.config.js                        ← NativeWind v4 Metro wrapper
├── tailwind.config.js                     ← Tailwind config (NativeWind v4)
├── global.css                             ← Tailwind entry point (NativeWind)
├── tsconfig.json                          ← TypeScript config (@/* path alias)
└── package.json
```

---

## Key Differences from Web Stacks

| | Next.js / React+Vite | Expo Stack |
|---|---|---|
| **Routing** | File-based / React Router | Expo Router (file-based) |
| **Styling** | Tailwind CSS (web) | NativeWind v4 (same className syntax) |
| **Elements** | `<div>`, `<p>`, `<button>` | `<View>`, `<Text>`, `<TouchableOpacity>` |
| **Auth storage** | Cookies / localStorage | expo-secure-store |
| **Navigation** | `router.push('/path')` | `router.push('/path')` (same API!) |
| **Scroll** | `overflow-y: scroll` | `<ScrollView>` |
| **Lists** | `.map()` | `<FlatList>` (for long lists) |
| **Backend** | Same Laravel API | Same Laravel API |
| **Build** | Next.js / Vite | Expo Go / Metro |
| **Live reload** | Hot Module Replacement | Expo Go fast refresh |

---

## Tatemono DSL — Native Section

```tsx
/* @arkzen:meta:native
framework: expo          ← optional, expo is default
sdk: 52
displayName: My App
orientation: portrait
primaryColor: '#6366f1'
*/

/* @arkzen:native:page:index
layout: guest
*/
export function IndexScreen() {
  const router = useRouter()

  return (
    <View className="flex-1 items-center justify-center p-6">
      <Text className="text-2xl font-bold text-neutral-900 mb-2">
        Welcome
      </Text>
      <TouchableOpacity
        className="px-6 py-3 bg-indigo-500 rounded-xl active:opacity-80"
        onPress={() => router.push('/my-app/login')}
      >
        <Text className="text-white font-semibold">Get Started</Text>
      </TouchableOpacity>
    </View>
  )
}

/* @arkzen:native:page:dashboard
layout: auth
*/
export function DashboardScreen() {
  return (
    <View className="flex-1 p-6">
      <Text className="text-xl font-semibold text-neutral-900">Dashboard</Text>
    </View>
  )
}
```

---

## Generated Output

For each `@arkzen:native:page:name` block, the engine generates:

```
src/screens/my-app/index.tsx      ← Screen component with NativeWind
src/screens/my-app/dashboard.tsx  ← Screen component with NativeWind
app/my-app/index.tsx              ← Expo Router file route (thin re-export)
app/my-app/dashboard.tsx          ← Expo Router file route (thin re-export)
src/arkzen/generated/routes.ts    ← Updated route registry
expo-registry.json                ← Updated tatemono registry
```

---

## Styling — NativeWind v4

Write exactly the same Tailwind class names as your web tatemonos:

```tsx
// Web (Next.js / React+Vite)
<div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-sm">

// Native (Expo) — identical className
<View className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-sm">
```

NativeWind translates Tailwind classes to React Native StyleSheet under the hood.
No separate style objects needed unless you're doing platform-specific overrides.

---

## Auth Flow

Same Sanctum token auth as web, different storage:

```
Web:    Cookie / localStorage  →  Authorization: Bearer {token}
Expo:   expo-secure-store      →  Authorization: Bearer {token}

API endpoints are identical — /api/{tatSlug}/auth/login|register|logout|me
```

---

## What Works (v1.0)

- ✅ Engine scaffold (watcher, builder, router, registry)
- ✅ Expo Router file-based routing
- ✅ NativeWind v4 (Tailwind className on native)
- ✅ AuthLayout / GuestLayout (NativeWind styled)
- ✅ useArkzenExpoAuth hook (SecureStore)
- ✅ Route registry (src/arkzen/generated/routes.ts)
- ✅ Tatemono types (extends shared types)
- ✅ Adapters (router, Link) matching web adapter pattern
- ✅ Stale module cleanup on startup
- ⏳ @arkzen:native:animation → Reanimated scroll triggers (v9.5 final)
- ⏳ @arkzen:native:config → app.json generation from tatemono meta (v9.5 final)
- ⏳ @arkzen:native:permissions → expo-permissions (v9.5 final)
- ⏳ @arkzen:native:navigation → tab bar / drawer config (v9.5 final)
- ⏳ Push notifications (expo-notifications) (v10)
- ⏳ Offline queue / AsyncStorage sync (v10)
