import { View, Text, Pressable, Alert, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
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
import { colors } from '@/theme'

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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Perfil</Text>

        {/* Profile card */}
        <Card padding="lg">
          <View style={styles.profileCenter}>
            <LinearGradient
              colors={['#FF4D8D22', '#9B6CFF22']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarRing}
            >
              <Avatar name={user.name} size="xl" variant="you" />
            </LinearGradient>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{formatCurrency(myTotal)}</Text>
              <Text style={styles.statLabel}>Total gasto</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{myCount}</Text>
              <Text style={styles.statLabel}>Transações</Text>
            </View>
          </View>
        </Card>

        {/* Couple card */}
        {couple && (
          <Card padding="lg">
            <View style={styles.coupleCardHeader}>
              <View style={styles.coupleIconBox}>
                <Users size={20} color={colors.primary[500]} />
              </View>
              <Text style={styles.coupleCardTitle}>Casal</Text>
            </View>

            {/* Invite code */}
            <View style={styles.inviteRow}>
              <View>
                <Text style={styles.inviteCodeLabel}>Código de convite</Text>
                <Text style={styles.inviteCode}>{couple.inviteCode}</Text>
              </View>
              <Pressable onPress={copyCode} style={styles.copyBtn}>
                <Copy size={16} color={colors.primary[500]} />
              </Pressable>
            </View>

            {/* Partner */}
            {partner ? (
              <View style={styles.partnerRow}>
                <Avatar name={partner.name} size="md" variant="partner" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.partnerName}>{partner.name}</Text>
                  <Text style={styles.partnerEmail}>{partner.email}</Text>
                </View>
                <Text style={styles.partnerTag}>Parceiro(a)</Text>
              </View>
            ) : (
              <View style={styles.waitingRow}>
                <Text style={styles.waitingText}>
                  Aguardando parceiro entrar com o código acima
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Logout */}
        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <View style={styles.logoutIcon}>
            <LogOut size={18} color={colors.error} />
          </View>
          <Text style={styles.logoutText}>Sair da conta</Text>
          <ChevronRight size={16} color={colors.muted} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: '#0F0E17' },
  scroll:          { padding: 20, gap: 16, paddingBottom: 40 },
  pageTitle:       { fontSize: 26, fontFamily: 'Inter_900Black', color: '#F0EEF8', marginBottom: 4 },
  profileCenter:   { alignItems: 'center', gap: 8 },
  avatarRing:      { padding: 3, borderRadius: 40, marginBottom: 4 },
  profileName:     { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#F0EEF8' },
  profileEmail:    { fontSize: 13, color: '#9B97B2', fontFamily: 'Inter_400Regular' },
  statsRow:        { flexDirection: 'row', marginTop: 20 },
  statBox:         { flex: 1, alignItems: 'center', gap: 4 },
  statDivider:     { width: 1, backgroundColor: '#2D2A3E' },
  statValue:       { fontSize: 20, fontFamily: 'Inter_900Black', color: '#FF4D8D' },
  statLabel:       { fontSize: 11, color: '#9B97B2', fontFamily: 'Inter_400Regular' },
  coupleCardHeader:{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  coupleIconBox:   { width: 40, height: 40, backgroundColor: '#2D1624', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  coupleCardTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#F0EEF8' },
  inviteRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#221F32', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12, borderWidth: 1, borderColor: '#2D2A3E' },
  inviteCodeLabel: { fontSize: 11, color: '#9B97B2', fontFamily: 'Inter_400Regular' },
  inviteCode:      { fontSize: 18, fontFamily: 'Inter_900Black', color: '#FF4D8D', letterSpacing: 3, marginTop: 2 },
  copyBtn:         { width: 36, height: 36, backgroundColor: '#2D1624', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  partnerRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1E1535', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#3D2E6B' },
  partnerName:     { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#F0EEF8' },
  partnerEmail:    { fontSize: 11, color: '#9B97B2', fontFamily: 'Inter_400Regular' },
  partnerTag:      { fontSize: 11, color: '#9B6CFF', fontFamily: 'Inter_600SemiBold' },
  waitingRow:      { backgroundColor: '#221F32', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#2D2A3E', borderStyle: 'dashed' },
  waitingText:     { fontSize: 13, color: '#9B97B2', textAlign: 'center', fontFamily: 'Inter_400Regular' },
  logoutBtn:       { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1A1827', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16, borderWidth: 1, borderColor: '#2D2A3E' },
  logoutIcon:      { width: 36, height: 36, backgroundColor: '#FF517022', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoutText:      { flex: 1, fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#F0EEF8' },
})
