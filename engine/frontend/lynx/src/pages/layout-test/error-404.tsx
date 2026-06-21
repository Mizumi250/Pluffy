// ARKZEN GENERATED — layout-test error 404 (Lynx)
// DO NOT EDIT DIRECTLY.
const NotFoundLynxPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => (
  <view className="flex-1 bg-indigo-50 items-center justify-center p-8">
    <view className="text-center max-w-md" style={{ gap: 8 }}>
      <text className="text-8xl font-black text-indigo-100 leading-none">404</text>
      <text className="text-xl font-bold text-neutral-900" style={{ marginTop: -8 }}>Page not found</text>
      <text className="text-sm text-neutral-500 mb-6">This route doesn't exist in the layout-test module.</text>
      <view
        bindtap={() => onNavigate('index')}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl"
      >
        <text className="text-white text-sm font-semibold">Back to Layout Test</text>
      </view>
    </view>
  </view>
)
