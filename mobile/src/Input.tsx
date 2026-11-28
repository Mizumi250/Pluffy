import React from 'react'
import { TextInput, TextInputProps } from 'react-native'
import { mono, radius, useTheme } from './theme'

export const Input = React.forwardRef<TextInput, TextInputProps & { code?: boolean }>(({ code, style, ...p }, ref) => {
  const { c } = useTheme()
  return (
    <TextInput ref={ref} placeholderTextColor={c.muted} selectionColor={c.primary} autoCapitalize="none" autoCorrect={false} spellCheck={false} {...p}
      style={[{ backgroundColor: c.chip, color: c.ink, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 12, minHeight: 52, fontSize: 16 }, code && { fontFamily: mono }, style]} />
  )
})
