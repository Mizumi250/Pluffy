// ARKZEN GENERATED — layout-test/native-deep (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-14T08:58:41.224Z
import { NativeLayerBadge } from './components/NativeLayerBadge'

/* @arkzen:native:page:layout:card-modal */

const NativeDeepLynxPage = () => (
  <view className="p-4" style={{ gap: 12 }}>
    <text className="text-lg font-black text-gray-900 mb-2">Deep Page</text>
    <text className="text-sm text-gray-600 leading-relaxed mb-3">
      Three native layouts deep:{'\n'}
      <text className="font-mono text-indigo-600">AppShellLayout → TabPanelLayout → CardModalLayout</text>.
      {'\n'}Only <text className="font-mono text-purple-600">layout:card-modal</text> declared.
    </text>
    <NativeLayerBadge layers={['AppShellLayout', 'TabPanelLayout', 'CardModalLayout']} />
  </view>
)

export const LayoutTestNativeDeep = NativeDeepLynxPage;
