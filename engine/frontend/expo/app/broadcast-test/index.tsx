// ============================================================
// ARKZEN EXPO ROUTE — broadcast-test/index (root redirect)
// Visiting /broadcast-test redirects to /broadcast-test/login
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

import { Redirect } from 'expo-router'

export default function ArkzenRootRedirect() {
  return <Redirect href="/broadcast-test/login" />
}
