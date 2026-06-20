// ARKZEN GENERATED — asset-hub/index (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:48.072Z
import { AssetRow } from './components/AssetRow'
import { CatBadge } from './components/CatBadge'
import { GuideRow } from './components/GuideRow'
import { LYNX_ASSET_REGISTRY } from './components/constants'
import { ScrollView, Text, View } from '@lynx-js/react'

const IndexScreen = () => (
  <ScrollView style={{ flex: 1, backgroundColor: '#fafafa' }} contentContainerStyle={{ padding: 24, paddingTop: 56, paddingBottom: 48 }}>

    <CatBadge label="📦 Asset Hub" />

    <Text style={{ fontSize: 28, fontWeight: '700', color: '#0f172a', marginTop: 16, marginBottom: 8, lineHeight: 34 }}>
      Asset Distribution
    </Text>
    <Text style={{ fontSize: 13, color: '#64748b', lineHeight: 22, marginBottom: 32 }}>
      Drop files into{' '}
      <Text style={{ fontFamily: 'monospace', color: '#6366f1' }}>tatemonos/asset-hub/assets/</Text>
      {' '}— engine distributes to the Lynx asset pipeline. Registered assets render below.
    </Text>

    {/* Drop guide */}
    <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 32 }}>
      <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 }}>
        Where to drop
      </Text>
      <GuideRow folder="assets/images/" desc="jpg, png, webp, gif" />
      <GuideRow folder="assets/svg/"    desc="svg files" />
      <GuideRow folder="assets/fonts/"  desc="ttf, otf, woff2" />
      <GuideRow folder="assets/audio/"  desc="mp3, wav, ogg" />
      <GuideRow folder="assets/video/"  desc="mp4, webm" />
      <View style={{ paddingVertical: 10 }}>
        <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#6366f1', marginBottom: 2 }}>assets/data/</Text>
        <Text style={{ fontSize: 11, color: '#94a3b8' }}>json, csv, xml</Text>
      </View>
    </View>

    {/* Registered assets */}
    <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 12 }}>
      Registered assets
    </Text>
    {LYNX_ASSET_REGISTRY.map(a => <AssetRow key={a.uri} asset={a} />)}

  </ScrollView>
)
