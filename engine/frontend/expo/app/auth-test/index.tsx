// ============================================================
// ARKZEN EXPO ROUTE — auth-test/index (root redirect)
// Visiting /auth-test redirects to /auth-test/login
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

import { Redirect } from 'expo-router'

export default function ArkzenRootRedirect() {
  return <Redirect href="/auth-test/login" />
}
