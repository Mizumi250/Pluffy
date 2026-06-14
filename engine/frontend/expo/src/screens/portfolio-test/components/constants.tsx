// ============================================================
// ARKZEN GENERATED NATIVE CONSTANTS — portfolio-test [Expo]
// Source: @arkzen:native:components (portfolio-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T08:07:15.936Z
// ============================================================

import React, { useState } from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { Linking, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

export const PROJECTS = [
  { id: 1, title: 'E-commerce',  description: 'Full-stack e-commerce',     image: '🛒', url: 'https://example.com', tags: ['Next.js', 'Laravel']   },
  { id: 2, title: 'Tasks',       description: 'Real-time collaboration',    image: '✓',  url: 'https://example.com', tags: ['React', 'WebSocket']   },
  { id: 3, title: 'Analytics',   description: 'Data dashboard',             image: '📊', url: 'https://example.com', tags: ['Chart.js', 'Laravel']  },
]

export const SKILLS = [
  { name: 'React',      category: 'Frontend', proficiency: 95 },
  { name: 'Next.js',    category: 'Frontend', proficiency: 92 },
  { name: 'Laravel',    category: 'Backend',  proficiency: 90 },
  { name: 'PostgreSQL', category: 'Database', proficiency: 85 },
]

export const CATEGORIES = Array.from(new Set(SKILLS.map(s => s.category)))
