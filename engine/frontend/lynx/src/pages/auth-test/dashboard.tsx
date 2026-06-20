// ARKZEN GENERATED — auth-test/dashboard (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:48.280Z
import { ScrollView, Text, TouchableOpacity, View } from '@lynx-js/react'
import { useAuthStore } from '../../../arkzen/core/stores/authStore'

const DashboardScreen = () => {
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>

      {/* Header */}
      <View style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f5f5f5', paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#171717' }}>✅ Auth Test</Text>
          <Text style={{ fontSize: 11, color: '#a3a3a3', marginTop: 2 }}>{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={{ fontSize: 11, color: '#a3a3a3' }}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Success card */}
        <View style={{ margin: 16, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#f5f5f5', padding: 32, alignItems: 'center' }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🛡️</Text>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#171717', marginBottom: 6 }}>
            Authentication successful
          </Text>
          <Text style={{ fontSize: 11, color: '#737373', textAlign: 'center', lineHeight: 20 }}>
            {`This screen is protected by the auth layout.\nOnly signed-in users can see it.`}
          </Text>
        </View>

        {/* User info */}
        <View style={{ marginHorizontal: 16, marginTop: 4, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#f5f5f5', padding: 20 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#171717', marginBottom: 12 }}>User info</Text>
          <View style={{ backgroundColor: '#fafafa', borderRadius: 12, padding: 16 }}>
            <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#737373', lineHeight: 20 }}>
              {JSON.stringify(user, null, 2)}
            </Text>
          </View>
        </View>

        {/* Footer note */}
        <View style={{ marginHorizontal: 16, marginTop: 16, marginBottom: 32, backgroundColor: '#f5f5f5', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 }}>
          <Text style={{ fontSize: 11, color: '#737373', fontFamily: 'monospace', lineHeight: 20 }}>
            {`token: Sanctum Bearer\nscope: auth-test SQLite\nshared: web ↔ native same token`}
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
