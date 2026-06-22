// ARKZEN GENERATED — layout-test/index (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T05:22:14.236Z

const IndexLynxPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => (
  <scroll-view className="flex-1 p-4 gap-y-3 pb-10">
    <text className="text-lg font-black text-gray-900">Layout Test</text>
    <text className="text-sm text-gray-600 leading-relaxed">
      This test demonstrates nested layout chains in the arkzen native framework. 
      Each screen declares a layout, which can chain to parent layouts or apply guards.
    </text>
    <view style={{ gap: 12 }}>
      <view
        bindtap={() => onNavigate('single')}
        className="w-full px-4 py-3 bg-indigo-600 rounded-lg"
      >
        <text className="text-white text-sm font-semibold">Single Layout</text>
        <text className="text-xs text-indigo-100">No chain, uses: AppShellLayout</text>
      </view>

      <view
        bindtap={() => onNavigate('chain')}
        className="w-full px-4 py-3 bg-indigo-600 rounded-lg"
      >
        <text className="text-white text-sm font-semibold">Layout Chain</text>
        <text className="text-xs text-indigo-100">Chain: AppShellLayout → TabPanelLayout</text>
      </view>

      <view
        bindtap={() => onNavigate('guard-only')}
        className="w-full px-4 py-3 bg-indigo-600 rounded-lg"
      >
        <text className="text-white text-sm font-semibold">Guard Only (+auth)</text>
        <text className="text-xs text-indigo-100">Uses AuthLayout guard, no custom layout</text>
      </view>

      <view
        bindtap={() => onNavigate('guard-chain')}
        className="w-full px-4 py-3 bg-indigo-600 rounded-lg"
      >
        <text className="text-white text-sm font-semibold">Guard + Chain (+auth:tab-panel)</text>
        <text className="text-xs text-indigo-100">Chain: AppShellLayout → TabPanelLayout → AuthLayout</text>
      </view>

      <view
        bindtap={() => onNavigate('native-parity')}
        className="w-full px-4 py-3 bg-indigo-600 rounded-lg"
      >
        <text className="text-white text-sm font-semibold">Native Parity Test</text>
        <text className="text-xs text-indigo-100">Demonstrates native + web layout equivalence</text>
      </view>

      {/* Guide Reference */}
      <view className="mt-8" style={{ gap: 8 }}>
        <text className="text-xs font-bold text-gray-700 uppercase tracking-wider">Guide Reference</text>
        {[
          { label: 'Single layout (no chain)', combo: 'layout: app-shell', tag: '@arkzen:native:layout:app-shell' },
          { label: 'Layout chaining', combo: 'layout: tab-panel (with parent: app-shell)', tag: '@arkzen:native:layout:tab-panel' },
          { label: 'Guard only', combo: 'layout: +auth', tag: 'Guard: AuthLayout' },
          { label: 'Guard + chain', combo: 'layout: +auth:tab-panel', tag: 'Chain: auth → app-shell' },
        ].map(({ label, combo, tag }) => (
          <view key={label} className="border border-indigo-300 border-opacity-40 rounded-lg p-3.5 flex-row items-center" style={{ gap: 12 }}>
            <view className="flex-1">
              <text className="text-xs font-bold text-gray-600">{label}</text>
              <text className="text-xs text-gray-500 mt-0.5">{combo}</text>
            </view>
            <view className="bg-indigo-100 px-2 py-0.5 rounded-md">
              <text className="text-xs text-indigo-700 font-bold font-mono">{tag}</text>
            </view>
          </view>
        ))}
      </view>
    </view>
  </scroll-view>
)

export const LayoutTestIndex = IndexLynxPage;
