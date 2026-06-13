// ============================================================
// ARKZEN EXPO ROUTE — upload-test/index (root redirect)
// Visiting /upload-test redirects to /upload-test/dashboard
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

import { Redirect } from 'expo-router'

export default function ArkzenRootRedirect() {
  return <Redirect href="/upload-test/dashboard" />
}
