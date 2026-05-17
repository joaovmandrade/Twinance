import { Redirect } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { useAuthStore } from '@/store/authStore'
import { useCoupleStore } from '@/store/coupleStore'
import { colors } from '@/theme'

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const { couple } = useCoupleStore()

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    )
  }

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />
  if (!couple)          return <Redirect href="/couple-setup" />
  return                       <Redirect href="/(app)/" />
}
