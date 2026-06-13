// ============================================================
// ARKZEN EXPO ROUTE — scheduler-test/index (root redirect)
// Visiting /scheduler-test redirects to /scheduler-test/dashboard
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

import { Redirect } from 'expo-router'

export default function ArkzenRootRedirect() {
  return <Redirect href="/scheduler-test/dashboard" />
}
