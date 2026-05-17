import { useState } from 'react'
import { View, Text, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Users, LogIn, Plus } from 'lucide-react-native'
import { Input, Button, Card } from '@/components/ui'
import { useCreateCouple, useJoinCouple } from '@/hooks/useCouple'
import { logout } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { useCoupleStore } from '@/store/coupleStore'
import { colors } from '@/theme'

export default function CoupleSetupScreen() {
  const [inviteCode, setInviteCode] = useState('')
  const { mutateAsync: createCouple, isPending: creating } = useCreateCouple()
  const { mutateAsync: joinCouple,   isPending: joining   } = useJoinCouple()
  const resetAuth   = useAuthStore((s) => s.reset)
  const resetCouple = useCoupleStore((s) => s.reset)

  async function handleCreate() {
    try {
      await createCouple()
      router.replace('/(app)/')
    } catch (err) {
      Alert.alert('Erro', (err as Error).message)
    }
  }

  async function handleJoin() {
    if (!inviteCode.trim()) {
      Alert.alert('Atenção', 'Digite o código de convite')
      return
    }
    try {
      await joinCouple(inviteCode.trim().toUpperCase())
      router.replace('/(app)/')
    } catch (err) {
      Alert.alert('Código inválido', (err as Error).message)
    }
  }

  async function handleLogout() {
    await logout()
    resetAuth()
    resetCouple()
    router.replace('/(auth)/login')
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
      <View className="flex-1 px-6 justify-center gap-8">
        {/* Header */}
        <View className="items-center gap-3">
          <View className="w-20 h-20 bg-primary-100 rounded-3xl items-center justify-center">
            <Users size={40} color={colors.primary[600]} />
          </View>
          <Text className="text-2xl font-black text-gray-900 text-center">Configurar casal</Text>
          <Text className="text-sm text-gray-500 text-center leading-relaxed">
            Crie um novo casal ou entre no casal{'\n'}do seu parceiro com o código de convite
          </Text>
        </View>

        {/* Create couple */}
        <Card padding="lg">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 bg-primary-100 rounded-2xl items-center justify-center">
              <Plus size={20} color={colors.primary[600]} />
            </View>
            <View>
              <Text className="text-base font-bold text-gray-900">Criar um casal</Text>
              <Text className="text-xs text-gray-500">Você receberá um código para compartilhar</Text>
            </View>
          </View>
          <Button
            label="Criar casal"
            onPress={handleCreate}
            loading={creating}
            fullWidth
          />
        </Card>

        {/* Divider */}
        <View className="flex-row items-center gap-3">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="text-xs font-semibold text-gray-400">OU</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        {/* Join couple */}
        <Card padding="lg">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 bg-violet-100 rounded-2xl items-center justify-center">
              <LogIn size={20} color={colors.primary[700]} />
            </View>
            <View>
              <Text className="text-base font-bold text-gray-900">Entrar em um casal</Text>
              <Text className="text-xs text-gray-500">Use o código do seu parceiro</Text>
            </View>
          </View>
          <View className="gap-3">
            <Input
              placeholder="Ex: TWIN-AB3X"
              value={inviteCode}
              onChangeText={(t) => setInviteCode(t.toUpperCase())}
              autoCapitalize="characters"
              maxLength={9}
            />
            <Button
              label="Entrar no casal"
              variant="secondary"
              onPress={handleJoin}
              loading={joining}
              fullWidth
            />
          </View>
        </Card>

        <Button label="Sair da conta" variant="ghost" onPress={handleLogout} size="sm" />
      </View>
    </SafeAreaView>
  )
}
