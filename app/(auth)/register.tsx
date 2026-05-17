import { useState } from 'react'
import { View, Text, ScrollView, Pressable, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, router } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, User } from 'lucide-react-native'
import { Input, Button } from '@/components/ui'
import { register } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { colors } from '@/theme'

const schema = z.object({
  name:     z.string().min(2, 'Nome muito curto'),
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type FormValues = z.infer<typeof schema>

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false)
  const setUser = useAuthStore((s) => s.setUser)

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '' },
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      const user = await register(values)
      setUser(user)
      router.replace('/couple-setup')
    } catch (err) {
      Alert.alert('Erro ao criar conta', (err as Error).message)
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
          <View className="gap-1">
            <Text className="text-3xl font-black text-gray-900">Criar conta</Text>
            <Text className="text-base text-gray-500">Junte-se ao Twinance</Text>
          </View>

          <View className="gap-4">
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Nome completo"
                  placeholder="João Silva"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                  error={errors.name?.message}
                  leftIcon={<User size={18} color={colors.gray[400]} />}
                />
              )}
            />

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
                  placeholder="Mínimo 6 caracteres"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  error={errors.password?.message}
                  leftIcon={<Lock size={18} color={colors.gray[400]} />}
                />
              )}
            />

            <Button
              label="Criar conta"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              fullWidth
              size="lg"
            />
          </View>

          <View className="flex-row justify-center gap-1">
            <Text className="text-sm text-gray-500">Já tem conta?</Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text className="text-sm font-bold text-primary-600">Entrar</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
