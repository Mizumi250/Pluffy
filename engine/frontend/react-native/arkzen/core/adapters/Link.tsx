// ============================================================
// ARKZEN ADAPTER — Link (React Native stack)
// No DOM — maps to TouchableOpacity + useNavigation.
// Shared utils.tsx compiles on native without any DOM dep.
// ============================================================
import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'

export const Link: React.FC<{
  href?:     string
  to?:       string
  children:  React.ReactNode
}> = ({ href, to, children }) => {
  const navigation = useNavigation<any>()
  const target = (to ?? href) as string

  return (
    <TouchableOpacity onPress={() => navigation.navigate(target)}>
      <Text style={styles.link}>{children}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  link: { color: '#6366f1', textDecorationLine: 'underline' },
})
