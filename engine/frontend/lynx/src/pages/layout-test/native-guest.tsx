// ARKZEN GENERATED — layout-test/native-guest (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T03:18:59.036Z
import { NativeLayerBadge } from './components/NativeLayerBadge'

/* @arkzen:native:page:layout:+guest */

const NativeGuestLynxPage = () => (
  <scroll-view className="flex-1 p-5 gap-y-3">
    <text className="text-lg font-black text-gray-900">Native Guest Guard</text>
    <text className="text-sm text-gray-600 leading-relaxed">
      Guest guard only. Uses <text className="font-mono text-indigo-600">+guest</text>.
      {'\n'}Redirects to dashboard if already authenticated.
    </text>
    <NativeLayerBadge layers={['GuestLayout (guard)']} />
  </scroll-view>
)

export const LayoutTestNativeGuest = NativeGuestLynxPage;
