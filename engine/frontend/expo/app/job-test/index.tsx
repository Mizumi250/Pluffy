// ============================================================
// ARKZEN EXPO ROUTE — job-test/index (root redirect)
// Visiting /job-test redirects to /job-test/dashboard
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

import { Redirect } from 'expo-router'

export default function ArkzenRootRedirect() {
  return <Redirect href="/job-test/dashboard" />
}
