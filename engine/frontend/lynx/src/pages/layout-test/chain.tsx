// ARKZEN GENERATED — layout-test/chain (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T03:18:59.010Z
import { NativeLayerBadge } from './components/NativeLayerBadge'

/* @arkzen:native:page:layout:tab-panel */

const ChainLynxPage = () => (
  <scroll-view className="flex-1 p-4 gap-y-3">
    <text className="text-lg font-black text-gray-900">Layout Chain</text>
    <text className="text-sm text-gray-600 leading-relaxed">
      Rendered inside <text className="font-mono text-indigo-600">AppShellLayout → TabPanelLayout</text>.
      {'\n'}TabPanelLayout declared <text className="font-mono text-purple-600">parent: app-shell</text> — chain resolved automatically.
    </text>
    <NativeLayerBadge layers={['AppShellLayout', 'TabPanelLayout']} />
  </scroll-view>
)

export const LayoutTestChain = ChainLynxPage;
