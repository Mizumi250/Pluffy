// ============================================================
// ARKZEN EXPO ROUTE — mail-test/index (root redirect)
// Visiting /mail-test redirects to /mail-test/login
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

import { Redirect } from 'expo-router'

export default function ArkzenRootRedirect() {
  return <Redirect href="/mail-test/login" />
}
