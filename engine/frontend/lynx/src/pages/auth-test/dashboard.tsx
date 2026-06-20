// ARKZEN GENERATED — auth-test/dashboard (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T15:23:52.670Z
import { useAuthStore } from '../../../arkzen/core/stores/authStore'

const DashboardScreen = () => {
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <view className="flex-1 bg-neutral-50">

      {/* Header */}
      <view className="bg-white border-b border-neutral-100 px-5 py-4 flex-row items-center justify-between">
        <view>
          <text className="text-base font-semibold text-neutral-900">✅ Auth Test</text>
          <text className="text-xs text-neutral-400 mt-0.5">{user?.email}</text>
        </view>
        <view bindtap={handleLogout}>
          <text className="text-xs text-neutral-400">Sign out</text>
        </view>
      </view>

      <scroll-view className="flex-1">
        {/* Success card */}
        <view className="m-4 bg-white rounded-3xl border border-neutral-100 p-8 items-center">
          <text className="text-4xl mb-3">🛡️</text>
          <text className="text-base font-semibold text-neutral-900 mb-1.5">
            Authentication successful
          </text>
          <text className="text-xs text-neutral-500 text-center leading-5">
            {`This screen is protected by the auth layout.\nOnly signed-in users can see it.`}
          </text>
        </view>

        {/* User info */}
        <view className="mx-4 mt-1 bg-white rounded-3xl border border-neutral-100 p-5">
          <text className="text-sm font-semibold text-neutral-900 mb-3">User info</text>
          <view className="bg-neutral-50 rounded-xl p-4">
            <text className="text-xs font-mono text-neutral-500 leading-5">
              {JSON.stringify(user, null, 2)}
            </text>
          </view>
        </view>

        {/* Footer note */}
        <view className="mx-4 mt-4 mb-8 bg-neutral-100 rounded-2xl px-4 py-3">
          <text className="text-xs text-neutral-500 font-mono leading-5">
            {`token: Sanctum Bearer\nscope: auth-test SQLite\nshared: web ↔ native same token`}
          </text>
        </view>
      </scroll-view>
    </view>
  )
}

export const AuthTestDashboard = DashboardScreen;
