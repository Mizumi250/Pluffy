// Small shared pieces: text, icons, buttons, grouped lists, sheets. Flat surfaces, no shadows, 8px spacing,
// 44px minimum touch targets, every status has an icon and a word (colour never carries it alone).
import React from 'react'
import { ActivityIndicator, Dimensions, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControlProps, ScrollView, StyleProp, StyleSheet, Text, TextProps, TextStyle, View, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Lucide from 'lucide-react-native'
import { mono, radius, space, useTheme, Colors } from './theme'
import { Blossom } from './Blossom'

// ---- text ----
type Variant = 'title' | 'h2' | 'body' | 'strong' | 'caption' | 'mono'
type ColorKey = 'ink' | 'muted' | 'ok' | 'warn' | 'err' | 'onPrimary'
const SIZES: Record<Variant, TextStyle> = {
  title: { fontSize: 32, lineHeight: 38 }, h2: { fontSize: 20, lineHeight: 26 },
  body: { fontSize: 16, lineHeight: 22 }, strong: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  caption: { fontSize: 14, lineHeight: 20 }, mono: { fontSize: 14, lineHeight: 20, fontFamily: mono },
}
export function T({ v = 'body', color, style, ...rest }: TextProps & { v?: Variant; color?: ColorKey }) {
  const { c, display } = useTheme()
  const font: TextStyle = (v === 'title' || v === 'h2') && display ? { fontFamily: display } : (v === 'title' || v === 'h2') ? { fontWeight: '700' } : {}
  return <Text {...rest} style={[SIZES[v], font, { color: c[color ?? (v === 'caption' ? 'muted' : 'ink')] }, style]} />
}

// ---- icons (Lucide, same set as Studio; falls back to a circle if a name is missing in the installed version) ----
const ALIAS: Record<string, string[]> = {
  'square-check': ['SquareCheck', 'CheckSquare'], 'circle-check': ['CircleCheck', 'CheckCircle'], 'circle-x': ['CircleX', 'XCircle'],
  'loader-circle': ['LoaderCircle', 'Loader2'], 'triangle-alert': ['TriangleAlert', 'AlertTriangle'], 'square-terminal': ['SquareTerminal', 'TerminalSquare'],
  'house': ['House', 'Home'], 'building-2': ['Building2'], 'file-code': ['FileCode', 'FileCode2'], 'list-checks': ['ListChecks'], 'trash-2': ['Trash2'],
  'refresh-cw': ['RefreshCw'], 'git-branch': ['GitBranch'], 'arrow-left-right': ['ArrowLeftRight'], 'chevron-left': ['ChevronLeft'], 'chevron-right': ['ChevronRight'],
}
const pascal = (n: string) => n.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('')
const found = new Map<string, any>()
function lookup(name: string): any {
  if (found.has(name)) return found.get(name)
  const L = Lucide as any
  const hit = [...(ALIAS[name] ?? []), pascal(name)].map((n) => L[n]).find(Boolean) ?? L.Circle ?? (() => null)
  found.set(name, hit); return hit
}
export function Icon({ name, size = 22, color, strokeWidth = 2 }: { name: string; size?: number; color?: string; strokeWidth?: number }) {
  const { c } = useTheme()
  const C = lookup(name)
  return <C size={size} color={color ?? c.ink} strokeWidth={strokeWidth} />
}

// ---- buttons ----
export function Button({ label, onPress, kind = 'secondary', icon, disabled, busy, full = true, style }: {
  label: string; onPress?: () => void; kind?: 'primary' | 'secondary' | 'danger' | 'plain'; icon?: string
  disabled?: boolean; busy?: boolean; full?: boolean; style?: StyleProp<ViewStyle>
}) {
  const { c } = useTheme()
  const bg = kind === 'primary' ? c.primary : kind === 'plain' ? 'transparent' : c.chip
  const press = kind === 'primary' ? c.primaryPress : c.chipPress
  const fg = kind === 'primary' ? c.onPrimary : kind === 'danger' ? c.err : c.ink
  const off = !!disabled || !!busy
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: off, busy: !!busy }} disabled={off} onPress={onPress}
      style={({ pressed }) => [{ minHeight: 48, borderRadius: radius.md, paddingHorizontal: space.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, backgroundColor: pressed ? press : bg, opacity: disabled ? 0.45 : 1 }, !full && { alignSelf: 'flex-start' }, style]}>
      {busy ? <ActivityIndicator color={fg} /> : icon ? <Icon name={icon} size={20} color={fg} /> : null}
      <Text style={{ color: fg, fontSize: 16, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  )
}

export function IconButton({ name, label, onPress, color, disabled }: { name: string; label: string; onPress?: () => void; color?: string; disabled?: boolean }) {
  const { c } = useTheme()
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress} hitSlop={4}
      style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? c.chipPress : 'transparent', opacity: disabled ? 0.4 : 1 })}>
      <Icon name={name} size={22} color={color ?? c.ink} />
    </Pressable>
  )
}

// ---- grouped list (the macOS / iOS inset style: cream page, surface-coloured groups) ----
export function Group({ title, sub, footer, children, style }: { title?: string; sub?: string; footer?: string; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme()
  const kids = React.Children.toArray(children).filter(Boolean)
  return (
    <View style={[{ marginBottom: space.lg }, style]}>
      {title ? (
        <View style={{ paddingHorizontal: space.md + 4, marginBottom: space.sm }}>
          <T v="strong">{title}</T>
          {sub ? <T v="caption">{sub}</T> : null}
        </View>
      ) : null}
      <View style={{ backgroundColor: c.surface, borderRadius: radius.md, overflow: 'hidden' }}>
        {kids.map((k, i) => (
          <View key={(k as any).key ?? i}>
            {i > 0 ? <View style={{ height: StyleSheet.hairlineWidth * 2, backgroundColor: c.line, marginLeft: space.md }} /> : null}
            {k}
          </View>
        ))}
      </View>
      {footer ? <T v="caption" style={{ paddingHorizontal: space.md + 4, marginTop: space.sm }}>{footer}</T> : null}
    </View>
  )
}

export function Row({ icon, title, sub, subMono, right, onPress, chevron, disabled, lines = 2, tile = true }: {
  icon?: string; title: string; sub?: string; subMono?: boolean; right?: React.ReactNode; onPress?: () => void
  chevron?: boolean; disabled?: boolean; lines?: number; tile?: boolean
}) {
  const { c } = useTheme()
  const inner = (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: space.md, minHeight: 56, gap: 12, opacity: disabled ? 0.55 : 1 }}>
      {icon ? (
        tile ? <View style={{ width: 36, height: 36, borderRadius: radius.sm, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={20} /></View>
          : <Icon name={icon} size={22} />
      ) : null}
      <View style={{ flex: 1 }}>
        <T v="strong" numberOfLines={1}>{title}</T>
        {sub ? <T v={subMono ? 'mono' : 'caption'} color="muted" numberOfLines={lines} style={subMono ? { fontSize: 13 } : undefined}>{sub}</T> : null}
      </View>
      {right}
      {(chevron ?? !!onPress) ? <Icon name="chevron-right" size={20} color={c.muted} /> : null}
    </View>
  )
  if (!onPress) return inner
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={sub ? `${title}. ${sub}` : title} accessibilityState={{ disabled: !!disabled }} onPress={onPress}
      style={({ pressed }) => ({ backgroundColor: pressed ? c.chip : 'transparent' })}>{inner}</Pressable>
  )
}

export function Segmented<V extends string>({ options, value, onChange }: { options: { v: V; label: string }[]; value: V; onChange: (v: V) => void }) {
  const { c } = useTheme()
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', backgroundColor: c.chip, borderRadius: 12, padding: 3 }}>
      {options.map((o) => {
        const on = o.v === value
        return (
          <Pressable key={o.v} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => onChange(o.v)}
            style={{ flex: 1, minHeight: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.surface : 'transparent' }}>
            <Text style={{ color: c.ink, fontSize: 15, fontWeight: on ? '700' : '500' }}>{o.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

export function Banner({ kind = 'info', text, action }: { kind?: 'info' | 'warn' | 'err'; text: string; action?: { label: string; onPress: () => void } }) {
  const { c } = useTheme()
  const color: ColorKey = kind === 'err' ? 'err' : kind === 'warn' ? 'warn' : 'ink'
  return (
    <View accessibilityRole="alert" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.surface, borderRadius: radius.md, padding: space.md, marginBottom: space.md }}>
      <Icon name={kind === 'info' ? 'info' : 'triangle-alert'} size={22} color={c[color]} />
      <View style={{ flex: 1 }}><T color={color} style={{ fontSize: 15, lineHeight: 21 }}>{text}</T></View>
      {action ? <Button label={action.label} onPress={action.onPress} full={false} style={{ minHeight: 44 }} /> : null}
    </View>
  )
}

export function Empty({ title, text, action }: { title: string; text: string; action?: { label: string; onPress: () => void } }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: space.xl, paddingHorizontal: space.lg, gap: space.sm }}>
      <Blossom size={56} />
      <T v="h2" style={{ textAlign: 'center', marginTop: space.sm }}>{title}</T>
      <T v="caption" style={{ textAlign: 'center', maxWidth: 320 }}>{text}</T>
      {action ? <Button label={action.label} onPress={action.onPress} full={false} style={{ marginTop: space.md }} /> : null}
    </View>
  )
}

// ---- page scaffolds ----
export function TabScreen({ title, right, children, refresh, scroll = true }: { title: string; right?: React.ReactNode; children: React.ReactNode; refresh?: React.ReactElement<RefreshControlProps>; scroll?: boolean }) {
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.md, paddingTop: space.sm, paddingBottom: space.sm, minHeight: 56 }}>
        <T v="title" accessibilityRole="header" style={{ flexShrink: 1 }}>{title}</T>
        {right}
      </View>
      {scroll
        ? <ScrollView keyboardShouldPersistTaps="handled" refreshControl={refresh} contentContainerStyle={{ paddingHorizontal: space.md, paddingBottom: space.xl }}>{children}</ScrollView>
        : <View style={{ flex: 1, paddingHorizontal: space.md }}>{children}</View>}
    </View>
  )
}

export function PageHeader({ title, sub, onBack, right }: { title: string; sub?: string; onBack: () => void; right?: React.ReactNode }) {
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  return (
    <View style={{ paddingTop: insets.top, backgroundColor: c.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 56, paddingHorizontal: space.sm, gap: 4 }}>
        <IconButton name="chevron-left" label="Back" onPress={onBack} />
        <View style={{ flex: 1 }}>
          <T v="h2" numberOfLines={1} accessibilityRole="header">{title}</T>
          {sub ? <T v="caption" numberOfLines={1}>{sub}</T> : null}
        </View>
        {right}
      </View>
    </View>
  )
}

export function Sheet({ visible, onClose, title, children, maxH = 0.85 }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode; maxH?: number }) {
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable accessibilityLabel="Close" onPress={onClose} style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }]} />
        <View style={{ backgroundColor: c.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, maxHeight: Dimensions.get('window').height * maxH, paddingBottom: insets.bottom + space.md }}>
          <View style={{ alignItems: 'center', paddingTop: 8 }}><View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.faint }} /></View>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: space.md, paddingRight: space.sm, minHeight: 52 }}>
            <T v="h2" style={{ flex: 1 }} numberOfLines={1} accessibilityRole="header">{title}</T>
            <IconButton name="x" label="Close" onPress={onClose} />
          </View>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

export function Spacer({ h = space.md }: { h?: number }) { return <View style={{ height: h }} /> }
export type { Colors }
