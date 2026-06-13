// ============================================================
// ARKZEN EXPO ROUTE — notification-test/index (root redirect)
// Visiting /notification-test redirects to /notification-test/login
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

import { Redirect } from 'expo-router'

export default function ArkzenRootRedirect() {
  return <Redirect href="/notification-test/login" />
}
