import { useState } from 'react'
import { View, Text, ScrollView, Pressable, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
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
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 justify-center gap-8">
          {/* Header */}
          <View className="items-center gap-2">
            <View className="w-16 h-16 bg-primary-600 rounded-3xl items-center justify-center mb-2">
              <Text className="text-3xl">💜</Text>
            </View>
            <Text className="text-4xl font-black text-gray-900">Twinance</Text>
            <Text className="text-base text-gray-500 text-center">
              Controle financeiro para casais
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4">
            <Text className="text-2xl font-bold text-gray-900">Entrar</Text>

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
                  leftIcon={<Mail size={18} color={colors.gray[400]} />}
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
                  leftIcon={<Lock size={18} color={colors.gray[400]} />}
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
          <View className="flex-row justify-center gap-1">
            <Text className="text-sm text-gray-500">Não tem conta?</Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text className="text-sm font-bold text-primary-600">Criar conta</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
