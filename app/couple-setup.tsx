import { useState } from 'react'
import { View, Text, Alert, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Input, Button } from '@/components/ui'
import { useCreateCouple, useJoinCouple } from '@/hooks/useCouple'
import { logout } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { useCoupleStore } from '@/store/coupleStore'

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
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Brand header */}
        <View style={styles.brand}>
          <LinearGradient
            colors={['#FF4D8D', '#9B6CFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoBox}
          >
            <Text style={styles.logoEmoji}>💑</Text>
          </LinearGradient>
          <Text style={styles.title}>Configurar casal</Text>
          <Text style={styles.subtitle}>
            Crie um novo casal ou entre no casal{'\n'}do seu parceiro com o código de convite
          </Text>
        </View>

        {/* Create couple */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconRose}>
              <Text style={{ fontSize: 18 }}>✨</Text>
            </View>
            <View>
              <Text style={styles.cardTitle}>Criar um casal</Text>
              <Text style={styles.cardSubtitle}>Você receberá um código para compartilhar</Text>
            </View>
          </View>
          <Button
            label="Criar casal"
            onPress={handleCreate}
            loading={creating}
            fullWidth
          />
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OU</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Join couple */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconViolet}>
              <Text style={{ fontSize: 18 }}>🔗</Text>
            </View>
            <View>
              <Text style={styles.cardTitle}>Entrar em um casal</Text>
              <Text style={styles.cardSubtitle}>Use o código do seu parceiro</Text>
            </View>
          </View>
          <View style={{ gap: 12 }}>
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
        </View>

        <Button label="Sair da conta" variant="ghost" onPress={handleLogout} size="sm" />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: '#0F0E17' },
  container:      { flex: 1, paddingHorizontal: 24, justifyContent: 'center', gap: 24 },
  brand:          { alignItems: 'center', gap: 10 },
  logoBox:        { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  logoEmoji:      { fontSize: 32 },
  title:          { fontSize: 26, fontFamily: 'Inter_900Black', color: '#F0EEF8', textAlign: 'center' },
  subtitle:       { fontSize: 14, color: '#9B97B2', textAlign: 'center', lineHeight: 22, fontFamily: 'Inter_400Regular' },
  card:           { backgroundColor: '#1A1827', borderRadius: 20, padding: 20, gap: 16, borderWidth: 1, borderColor: '#2D2A3E' },
  cardHeader:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIconRose:   { width: 44, height: 44, backgroundColor: '#2D1624', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardIconViolet: { width: 44, height: 44, backgroundColor: '#1E1535', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardTitle:      { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#F0EEF8' },
  cardSubtitle:   { fontSize: 12, color: '#9B97B2', fontFamily: 'Inter_400Regular', marginTop: 2 },
  divider:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine:    { flex: 1, height: 1, backgroundColor: '#2D2A3E' },
  dividerText:    { fontSize: 12, fontFamily: 'Inter_700Bold', color: '#544F68' },
})
