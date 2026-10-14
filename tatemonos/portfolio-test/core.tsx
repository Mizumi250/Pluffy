/* @arkzen:meta
name: portfolio-test
version: 1.0.0
description: Frontend-only portfolio showcase
auth: false
*/

/* @arkzen:web:config
toast:
  position: top-right
  duration: 3000
layout:
  guest:
    className: "min-h-screen bg-neutral-50"
*/

/* @arkzen:web:components:shared */

'use client'

import React from 'react'
import { Code2, Mail, CodeXml as Github, BriefcaseBusiness as Linkedin, ExternalLink, Star } from 'lucide-react'

const PROJECTS = [
  { id: 1, title: 'E-commerce', description: 'Full-stack e-commerce', image: '🛒', url: 'https://example.com', tags: ['Next.js', 'Laravel'] },
  { id: 2, title: 'Tasks', description: 'Real-time collaboration', image: '✓', url: 'https://example.com', tags: ['React', 'WebSocket'] },
  { id: 3, title: 'Analytics', description: 'Data dashboard', image: '📊', url: 'https://example.com', tags: ['Chart.js', 'Laravel'] }
]

const SKILLS = [
  { name: 'React', category: 'Frontend', proficiency: 95 },
  { name: 'Next.js', category: 'Frontend', proficiency: 92 },
  { name: 'Laravel', category: 'Backend', proficiency: 90 },
  { name: 'PostgreSQL', category: 'Database', proficiency: 85 }
]

/* @arkzen:web:components:shared:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */
const PortfolioPage = () => {
  const [submitted, setSubmitted] = React.useState(false)
  const categories = Array.from(new Set(SKILLS.map(s => s.category)))

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-2">
          <Code2 size={24} className="text-neutral-900" />
          <span className="font-semibold text-neutral-900">Portfolio</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-20">
        <section className="text-center">
          <h1 className="text-5xl font-semibold text-neutral-900 mb-4">Full-Stack Developer</h1>
          <p className="text-lg text-neutral-600">Crafting digital experiences</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-neutral-900 mb-8 flex items-center gap-2"><Star size={20} />Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROJECTS.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-md transition">
                <div className="h-32 bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center text-5xl">{p.image}</div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">{p.title}</h3>
                  <p className="text-sm text-neutral-600 mb-4">{p.description}</p>
                  <div className="flex gap-2 mb-4">
                    {p.tags.map((t, i) => (<span key={i} className="px-2 py-1 text-xs bg-neutral-100 text-neutral-600 rounded">{t}</span>))}
                  </div>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-neutral-900 font-medium">View <ExternalLink size={14} /></a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-neutral-900 mb-12">Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {categories.map(cat => (
              <div key={cat}>
                <h3 className="text-sm font-semibold text-neutral-900 mb-6">{cat}</h3>
                <div className="space-y-4">
                  {SKILLS.filter(s => s.category === cat).map((s, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-neutral-700">{s.name}</span>
                        <span className="text-xs text-neutral-500">{s.proficiency}%</span>
                      </div>
                      <div className="h-2 bg-neutral-200 rounded-full"><div className="h-full bg-neutral-900" style={{ width: `${s.proficiency}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-neutral-200 p-8">
          <div className="flex items-center gap-2 mb-6">
            <Mail size={20} className="text-neutral-900" />
            <h2 className="text-2xl font-semibold text-neutral-900">Contact</h2>
          </div>
          {submitted && <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-600 text-sm">Thanks!</div>}
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); setTimeout(() => setSubmitted(false), 3000) }} className="space-y-4">
            <input type="text" placeholder="Name" required className="w-full px-4 py-2 text-sm border border-neutral-200 rounded-lg" />
            <input type="email" placeholder="Email" required className="w-full px-4 py-2 text-sm border border-neutral-200 rounded-lg" />
            <textarea placeholder="Message" rows={4} required className="w-full px-4 py-2 text-sm border border-neutral-200 rounded-lg resize-none" />
            <button type="submit" className="w-full bg-neutral-900 text-white text-sm font-medium py-2 rounded-lg hover:bg-neutral-800">Send</button>
          </form>
        </section>
      </main>
    </div>
  )
}

/* @arkzen:web:page:index:end */

/* @arkzen:native:components:shared */

/* @arkzen:import:expo */
import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native'
import { useRouter } from 'expo-router'
import { setActiveTatemono } from '@/arkzen/core/stores/authStore'

setActiveTatemono('portfolio-test')
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { setActiveTatemono } from '@/arkzen/core/stores/authStore'

setActiveTatemono('portfolio-test')
/* @arkzen:import:rn:end */

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

/* @arkzen:native:components:shared:end */


/* @arkzen:native:page:index */
/* @arkzen:native:page:layout:guest */

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

/* @arkzen:native:page:index:end */

// ─────────────────────────────────────────────────────────────────────────────
// LYNX NATIVE COMPONENTS & PAGES
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:components:lynx:shared */

import React from 'react'
import { openURL } from '@/arkzen/core/native-bridge'

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

/* @arkzen:native:components:lynx:shared:end */

/* @arkzen:native:page:lynx:index */
/* @arkzen:native:page:layout:guest */

import { useState } from '@lynx-js/react'

const IndexLynxPage = () => {
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
    <scroll-view className="flex-1 bg-neutral-50">
      {/* Header */}
      <view className="bg-white border-b border-neutral-200">
        <view className="px-6 py-4 flex-row items-center" style={{ gap: 8 }}>
          <text className="text-2xl">💻</text>
          <text className="font-semibold text-neutral-900">Portfolio</text>
        </view>
      </view>

      <view className="px-6 py-16" style={{ gap: 80 }}>
        {/* Hero */}
        <view className="items-center">
          <text className="text-5xl font-semibold text-neutral-900 mb-4 text-center">Full-Stack Developer</text>
          <text className="text-lg text-neutral-600">Crafting digital experiences</text>
        </view>

        {/* Projects */}
        <view>
          <view className="flex-row items-center mb-8" style={{ gap: 8 }}>
            <text className="text-2xl font-semibold text-neutral-900">⭐ Projects</text>
          </view>
          <view className="flex-row flex-wrap" style={{ gap: 24 }}>
            {PROJECTS.map(p => (
              <view key={p.id} className="flex-1 bg-white rounded-2xl border border-neutral-200" style={{ overflow: 'hidden', minWidth: '30%' }}>
                <view className="h-32 bg-neutral-100 items-center justify-center">
                  <text className="text-5xl">{p.image}</text>
                </view>
                <view className="p-6">
                  <text className="text-lg font-semibold text-neutral-900 mb-2">{p.title}</text>
                  <text className="text-sm text-neutral-600 mb-4">{p.description}</text>
                  <view className="flex-row flex-wrap mb-4" style={{ gap: 8 }}>
                    {p.tags.map((t, i) => (
                      <text key={i} className="px-2 py-1 text-xs bg-neutral-100 text-neutral-600 rounded">{t}</text>
                    ))}
                  </view>
                  <text className="text-sm text-neutral-900 font-medium" bindtap={() => openURL(p.url)}>View ↗</text>
                </view>
              </view>
            ))}
          </view>
        </view>

        {/* Skills */}
        <view>
          <text className="text-2xl font-semibold text-neutral-900 mb-12">Skills</text>
          <view className="flex-row flex-wrap" style={{ gap: 48 }}>
            {CATEGORIES.map(cat => (
              <view key={cat} className="flex-1" style={{ minWidth: '45%' }}>
                <text className="text-sm font-semibold text-neutral-900 mb-6" style={{ letterSpacing: 1.5, textTransform: 'uppercase' }}>{cat}</text>
                <view style={{ gap: 16 }}>
                  {SKILLS.filter(s => s.category === cat).map((s, i) => (
                    <view key={i}>
                      <view className="flex-row justify-between mb-2">
                        <text className="text-sm text-neutral-700">{s.name}</text>
                        <text className="text-xs text-neutral-500">{s.proficiency}%</text>
                      </view>
                      <view className="h-2 bg-neutral-200 rounded-full">
                        <view className="h-full bg-neutral-900 rounded-full" style={{ width: `${s.proficiency}%` }} />
                      </view>
                    </view>
                  ))}
                </view>
              </view>
            ))}
          </view>
        </view>

        {/* Contact */}
        <view className="bg-white rounded-2xl border border-neutral-200 p-8">
          <view className="flex-row items-center mb-6" style={{ gap: 8 }}>
            <text className="text-2xl">✉️</text>
            <text className="text-2xl font-semibold text-neutral-900">Contact</text>
          </view>
          {submitted && (
            <view className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <text className="text-emerald-600 text-sm">Thanks! Message sent.</text>
            </view>
          )}
          <view style={{ gap: 16 }}>
            <input
              type="text"
              placeholder="Name"
              bindinput={(e) => setName(e.detail.value)}
              className="w-full px-4 py-2 text-sm border border-neutral-200 rounded-lg"
            />
            <input
              type="email"
              placeholder="Email"
              bindinput={(e) => setEmail(e.detail.value)}
              className="w-full px-4 py-2 text-sm border border-neutral-200 rounded-lg"
            />
            <textarea
              placeholder="Message"
              maxlines={4}
              bindinput={(e) => setMessage(e.detail.value)}
              className="w-full px-4 py-2 text-sm border border-neutral-200 rounded-lg"
            />
            <view
              bindtap={handleSend}
              className="w-full bg-neutral-900 rounded-lg py-2 items-center"
            >
              <text className="text-white text-sm font-medium">Send</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  )
}

/* @arkzen:native:page:lynx:index:end */
