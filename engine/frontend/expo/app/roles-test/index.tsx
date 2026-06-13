// ============================================================
// ARKZEN EXPO ROUTE — roles-test/index (root redirect)
// Visiting /roles-test redirects to /roles-test/login
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

import { Redirect } from 'expo-router'

export default function ArkzenRootRedirect() {
  return <Redirect href="/roles-test/login" />
}
