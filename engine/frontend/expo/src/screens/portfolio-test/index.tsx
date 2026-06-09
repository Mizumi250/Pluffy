// ============================================================
// ARKZEN GENERATED SCREEN — portfolio-test/index
// ============================================================

import React, { useState } from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { Linking, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { GuestLayout } from '@/layouts/GuestLayout'

import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'

// Shared components (from @arkzen:native:components:*)
const PROJECTS = [
  { id: 1, title: 'E-commerce',  description: 'Full-stack e-commerce',     image: '🛒', url: 'https://example.com', tags: ['Next.js', 'Laravel']   },
  { id: 2, title: 'Tasks',       description: 'Real-time collaboration',    image: '✓',  url: 'https://example.com', tags: ['React', 'WebSocket']   },
  { id: 3, title: 'Analytics',   description: 'Data dashboard',             image: '📊', url: 'https://example.com', tags: ['Chart.js', 'Laravel']  },
]

const SKILLS = [
  { name: 'React',      category: 'Frontend', proficiency: 95 },
  { name: 'Next.js',    category: 'Frontend', proficiency: 92 },
  { name: 'Laravel',    category: 'Backend',  proficiency: 90 },
  { name: 'PostgreSQL', category: 'Database', proficiency: 85 },
]

const CATEGORIES = Array.from(new Set(SKILLS.map(s => s.category)))

// User screen (from @arkzen:native:page:index)
const IndexScreen = () => {
  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [message,   setMessage]   = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSend = () => {
    if (!name || !email || !message) return
    setSubmitted(true)
    setName(''); setEmail(''); setMessage('')
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >

      {/* Header */}
      <View className="bg-white border-b border-neutral-200 px-5 py-4 flex-row items-center gap-x-2">
        <Text className="text-base">💻</Text>
        <Text className="text-sm font-semibold text-neutral-900">Portfolio</Text>
      </View>

      {/* Hero */}
      <View className="px-5 py-14 items-center">
        <Text className="text-3xl font-semibold text-neutral-900 text-center mb-2">
          Full-Stack Developer
        </Text>
        <Text className="text-sm text-neutral-500 text-center">
          Crafting digital experiences
        </Text>
      </View>

      {/* Projects */}
      <View className="px-5 mb-12">
        <View className="flex-row items-center gap-x-2 mb-6">
          <Text className="text-base">⭐</Text>
          <Text className="text-xl font-semibold text-neutral-900">Projects</Text>
        </View>
        <View className="gap-y-4">
          {PROJECTS.map(p => (
            <View key={p.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              {/* Thumbnail */}
              <View className="h-24 bg-neutral-100 items-center justify-center">
                <Text className="text-4xl">{p.image}</Text>
              </View>
              <View className="p-5">
                <Text className="text-base font-semibold text-neutral-900 mb-1">{p.title}</Text>
                <Text className="text-sm text-neutral-500 mb-3">{p.description}</Text>
                {/* Tags */}
                <View className="flex-row flex-wrap gap-2 mb-4">
                  {p.tags.map((t, i) => (
                    <View key={i} className="px-2.5 py-1 bg-neutral-100 rounded">
                      <Text className="text-xs text-neutral-600">{t}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity onPress={() => Linking.openURL(p.url)} activeOpacity={0.7}>
                  <Text className="text-sm font-medium text-neutral-900">View ↗</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Skills */}
      <View className="px-5 mb-12">
        <Text className="text-xl font-semibold text-neutral-900 mb-8">Skills</Text>
        <View className="gap-y-8">
          {CATEGORIES.map(cat => (
            <View key={cat}>
              <Text className="text-xs font-semibold text-neutral-900 mb-4 uppercase tracking-widest">
                {cat}
              </Text>
              <View className="gap-y-4">
                {SKILLS.filter(s => s.category === cat).map((s, i) => (
                  <View key={i}>
                    <View className="flex-row justify-between mb-1.5">
                      <Text className="text-sm text-neutral-700">{s.name}</Text>
                      <Text className="text-xs text-neutral-400">{s.proficiency}%</Text>
                    </View>
                    <View className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-neutral-900 rounded-full"
                        style={{ width: `${s.proficiency}%` }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Contact */}
      <View className="mx-5 bg-white rounded-2xl border border-neutral-200 p-6">
        <View className="flex-row items-center gap-x-2 mb-6">
          <Text className="text-base">✉️</Text>
          <Text className="text-xl font-semibold text-neutral-900">Contact</Text>
        </View>

        {submitted && (
          <View className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <Text className="text-sm text-emerald-600">Thanks! Message sent.</Text>
          </View>
        )}

        <View className="gap-y-3">
          <TextInput
            className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
            placeholder="Name"
            placeholderTextColor="#a3a3a3"
            value={name}
            onChangeText={setName}
            autoCorrect={false}
          />
          <TextInput
            className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
            placeholder="Email"
            placeholderTextColor="#a3a3a3"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
            placeholder="Message"
            placeholderTextColor="#a3a3a3"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{ minHeight: 96 }}
          />
          <TouchableOpacity
            onPress={handleSend}
            activeOpacity={0.8}
            className="bg-neutral-900 rounded-xl py-3.5 items-center"
          >
            <Text className="text-white text-sm font-semibold">Send</Text>
          </TouchableOpacity>
        </View>
      </View>

    </ScrollView>
  )
}

// Engine wrapper
export function ArkzenScreen_PortfolioTest_Index() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('portfolio-test')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <GuestLayout tatSlug="portfolio-test" dashboardRoute="/portfolio-test/dashboard">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <IndexScreen />
      </ScrollView>
      </GuestLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_PortfolioTest_Index
