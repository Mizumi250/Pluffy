// ARKZEN GENERATED — asset-hub/index (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T15:23:52.512Z
import { AssetRow } from './components/AssetRow'
import { CatBadge } from './components/CatBadge'
import { GuideRow } from './components/GuideRow'
import { LYNX_ASSET_REGISTRY } from './components/constants'

const IndexScreen = () => (
  <scroll-view className="flex-1 bg-[#fafafa] p-6 pt-14 pb-12">

    <CatBadge label="📦 Asset Hub" />

    <text className="text-[28px] font-bold text-[#0f172a] mt-4 mb-2 leading-[34px]">
      Asset Distribution
    </text>
    <text className="text-[13px] text-[#64748b] leading-[22px] mb-8">
      Drop files into{' '}
      <text className="font-mono text-[#6366f1]">tatemonos/asset-hub/assets/</text>
      {' '}— engine distributes to the Lynx asset pipeline. Registered assets render below.
    </text>

    {/* Drop guide */}
    <view className="bg-white border border-[#f1f5f9] rounded-2xl px-4 py-3 mb-8">
      <text className="text-[11px] font-semibold tracking-wide uppercase text-[#94a3b8] mb-2">
        Where to drop
      </text>
      <GuideRow folder="assets/images/" desc="jpg, png, webp, gif" />
      <GuideRow folder="assets/svg/"    desc="svg files" />
      <GuideRow folder="assets/fonts/"  desc="ttf, otf, woff2" />
      <GuideRow folder="assets/audio/"  desc="mp3, wav, ogg" />
      <GuideRow folder="assets/video/"  desc="mp4, webm" />
      <view className="py-2.5">
        <text className="text-[11px] font-mono text-[#6366f1] mb-0.5">assets/data/</text>
        <text className="text-[11px] text-[#94a3b8]">json, csv, xml</text>
      </view>
    </view>

    {/* Registered assets */}
    <text className="text-[11px] font-semibold tracking-wide uppercase text-[#94a3b8] mb-3">
      Registered assets
    </text>
    {LYNX_ASSET_REGISTRY.map(a => <AssetRow key={a.uri} asset={a} />)}

  </scroll-view>
)

export const AssetHubIndex = IndexScreen;
