// ============================================================
// ARKZEN EXPO ROUTE — errors-test/+not-found
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

import React from 'react'
import { useRouter } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'
import { NativeErrorScreen } from '@/screens/errors-test/components/NativeErrorScreen'

/* @arkzen:resolved:import expo */
const NativeNotFoundScreen = () => <NativeErrorScreen code={404} />

export default NativeNotFoundScreen
