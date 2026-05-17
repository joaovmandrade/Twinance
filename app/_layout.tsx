import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryClientProvider } from '@tanstack/react-query'
import * as SplashScreen from 'expo-splash-screen'
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black,
} from '@expo-google-fonts/inter'
import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/store/authStore'
import { useCoupleStore } from '@/store/coupleStore'
import { getSessionUser } from '@/services/authService'
import { getMyCouple } from '@/services/coupleService'
import { supabase } from '@/lib/supabase'
import '../global.css'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const { setUser, setLoading, isLoading } = useAuthStore()
  const { setCoupleData } = useCoupleStore()

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,
  })

  useEffect(() => {
    async function init() {
      try {
        const user = await getSessionUser()
        setUser(user)
        if (user) {
          try {
            const { couple, partner } = await getMyCouple()
            setCoupleData(couple, partner)
          } catch {
            setCoupleData(null, null)
          }
        }
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Auth state listener for token refresh / sign-out events
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setCoupleData(null, null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, isLoading])

  if (!fontsLoaded) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
            <Stack.Screen
              name="couple-setup"
              options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
            />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
