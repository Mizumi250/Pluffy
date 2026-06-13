// ============================================================
// ARKZEN EXPO ROUTE — body-mail-notification/index (root redirect)
// Visiting /body-mail-notification redirects to /body-mail-notification/login
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

import { Redirect } from 'expo-router'

export default function ArkzenRootRedirect() {
  return <Redirect href="/body-mail-notification/login" />
}
