import { View, Text, Pressable, Alert, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import * as Clipboard from 'expo-clipboard'
import * as Haptics from 'expo-haptics'
import { Copy, LogOut, Users, ChevronRight } from 'lucide-react-native'
import { useAuthStore } from '@/store/authStore'
import { useCoupleStore } from '@/store/coupleStore'
import { useExpenses } from '@/hooks/useExpenses'
import { logout } from '@/services/authService'
import { getTotalByUser } from '@/services/expenseService'
import { formatCurrency } from '@/utils/format'
import { Avatar, Card } from '@/components/ui'
import { colors, shadows } from '@/theme'

export default function ProfileScreen() {
  const user    = useAuthStore((s) => s.user)
  const partner = useCoupleStore((s) => s.partner)
  const couple  = useCoupleStore((s) => s.couple)
  const resetAuth   = useAuthStore((s) => s.reset)
  const resetCouple = useCoupleStore((s) => s.reset)
  const { expenses } = useExpenses()

  const myTotal = user ? getTotalByUser(expenses, user.id) : 0
  const myCount = user ? expenses.filter((e) => e.userId === user.id).length : 0

  async function copyCode() {
    if (!couple?.inviteCode) return
    await Clipboard.setStringAsync(couple.inviteCode)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    Alert.alert('Copiado!', 'Código copiado para a área de transferência.')
  }

  async function handleLogout() {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout()
          resetAuth()
          resetCouple()
          router.replace('/(auth)/login')
        },
      },
    ])
  }

  if (!user) return null

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl text-gray-900 mb-2" style={{ fontFamily: 'Inter_900Black' }}>
          Perfil
        </Text>

        {/* Profile card */}
        <Card padding="lg">
          <View className="items-center gap-3">
            <Avatar name={user.name} size="xl" />
            <View className="items-center">
              <Text className="text-xl font-bold text-gray-900">{user.name}</Text>
              <Text className="text-sm text-gray-500">{user.email}</Text>
            </View>
          </View>

          <View className="flex-row gap-4 mt-5">
            <View className="flex-1 bg-gray-50 rounded-2xl p-3 items-center gap-1">
              <Text className="text-xl font-black text-primary-600">{formatCurrency(myTotal)}</Text>
              <Text className="text-xs text-gray-500">Total gasto</Text>
            </View>
            <View className="flex-1 bg-gray-50 rounded-2xl p-3 items-center gap-1">
              <Text className="text-xl font-black text-primary-600">{myCount}</Text>
              <Text className="text-xs text-gray-500">Transações</Text>
            </View>
          </View>
        </Card>

        {/* Couple card */}
        {couple && (
          <Card padding="lg">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 bg-primary-100 rounded-2xl items-center justify-center">
                <Users size={20} color={colors.primary[600]} />
              </View>
              <Text className="text-base font-bold text-gray-900">Casal</Text>
            </View>

            {/* Invite code */}
            <View className="flex-row items-center justify-between bg-gray-50 rounded-2xl px-4 py-3 mb-3">
              <View>
                <Text className="text-xs text-gray-500">Código de convite</Text>
                <Text className="text-base font-black text-primary-700 tracking-widest">
                  {couple.inviteCode}
                </Text>
              </View>
              <Pressable
                onPress={copyCode}
                className="w-9 h-9 bg-primary-100 rounded-xl items-center justify-center"
              >
                <Copy size={16} color={colors.primary[600]} />
              </Pressable>
            </View>

            {/* Partner */}
            {partner ? (
              <View className="flex-row items-center gap-3 bg-violet-50 rounded-2xl px-4 py-3">
                <Avatar name={partner.name} size="md" />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-900">{partner.name}</Text>
                  <Text className="text-xs text-gray-500">{partner.email}</Text>
                </View>
                <Text className="text-xs text-primary-600 font-semibold">Parceiro(a)</Text>
              </View>
            ) : (
              <View className="bg-gray-50 rounded-2xl px-4 py-3">
                <Text className="text-sm text-gray-400 text-center">
                  Aguardando parceiro entrar com o código acima
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          className="flex-row items-center gap-3 bg-white rounded-2xl px-5 py-4 active:bg-gray-50"
          style={shadows.sm}
        >
          <View className="w-9 h-9 bg-red-50 rounded-xl items-center justify-center">
            <LogOut size={18} color="#ef4444" />
          </View>
          <Text className="flex-1 text-sm font-semibold text-gray-800">Sair da conta</Text>
          <ChevronRight size={16} color={colors.gray[400]} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}
