import { useState } from 'react'
import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Link, router } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock } from 'lucide-react-native'
import { Input, Button } from '@/components/ui'
import { login } from '@/services/authService'
import { getMyCouple } from '@/services/coupleService'
import { useAuthStore } from '@/store/authStore'
import { useCoupleStore } from '@/store/coupleStore'
import { colors } from '@/theme'

const schema = z.object({
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type FormValues = z.infer<typeof schema>

export default function LoginScreen() {
  const [loading, setLoading] = useState(false)
  const setUser = useAuthStore((s) => s.setUser)
  const setCoupleData = useCoupleStore((s) => s.setCoupleData)

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      const user = await login(values)
      setUser(user)
      try {
        const { couple, partner } = await getMyCouple()
        setCoupleData(couple, partner)
        router.replace('/(app)/')
      } catch {
        setCoupleData(null, null)
        router.replace('/couple-setup')
      }
    } catch (err) {
      Alert.alert('Erro ao entrar', (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Brand */}
          <View style={styles.brand}>
            <LinearGradient
              colors={['#FF4D8D', '#9B6CFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBox}
            >
              <Text style={styles.logoEmoji}>💑</Text>
            </LinearGradient>
            <Text style={styles.appName}>Twinance</Text>
            <Text style={styles.tagline}>Finanças a dois, no mesmo ritmo</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Entrar</Text>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="E-mail"
                  placeholder="seu@email.com"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  error={errors.email?.message}
                  leftIcon={<Mail size={18} color={colors.muted} />}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Senha"
                  placeholder="••••••••"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  autoComplete="password"
                  error={errors.password?.message}
                  leftIcon={<Lock size={18} color={colors.muted} />}
                />
              )}
            />

            <Button
              label="Entrar"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              fullWidth
              size="lg"
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem conta?</Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text style={styles.footerLink}>Criar conta</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#0F0E17' },
  scroll:    { flexGrow: 1 },
  container: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', gap: 40 },
  brand:     { alignItems: 'center', gap: 10 },
  logoBox:   { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  logoEmoji: { fontSize: 32 },
  appName:   { fontSize: 34, fontFamily: 'Inter_900Black', color: '#F0EEF8', letterSpacing: -0.5 },
  tagline:   { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#9B97B2', textAlign: 'center' },
  form:      { gap: 16 },
  formTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#F0EEF8', marginBottom: 4 },
  footer:    { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  footerText: { fontSize: 14, color: '#9B97B2', fontFamily: 'Inter_400Regular' },
  footerLink: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#FF4D8D' },
})
