// ============================================================
// ARKZEN EXPO ROUTE — errors-test/+not-found
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

import { useRouter } from 'expo-router'
import { NativeErrorScreen } from '../screens/errors-test/components/NativeErrorScreen'

const NativeNotFoundScreen = () => <NativeErrorScreen code={404} />

export default NativeNotFoundScreen
