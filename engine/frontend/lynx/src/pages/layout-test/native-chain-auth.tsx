// ARKZEN GENERATED — layout-test/native-chain-auth (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T09:47:15.671Z
import { NativeLayerBadge } from './components/NativeLayerBadge'

/* @arkzen:native:page:layout:+auth:tab-panel */

const NativeChainAuthLynxPage = () => (
  <scroll-view className="flex-1 p-4 gap-y-3">
    <text className="text-lg font-black text-gray-900">Native Chain + Auth</text>
    <text className="text-sm text-gray-600 leading-relaxed">
      Auth guard wrapped in full native chain:{'\n'}
      <text className="font-mono text-indigo-600">AppShellLayout → TabPanelLayout → AuthLayout</text>.
      {'\n'}Declared as <text className="font-mono text-purple-600">+auth:tab-panel</text>.
    </text>
    <NativeLayerBadge layers={['AppShellLayout', 'TabPanelLayout', 'AuthLayout (guard)']} />
  </scroll-view>
)

export const LayoutTestNativeChainAuth = NativeChainAuthLynxPage;
