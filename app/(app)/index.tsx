import { useMemo, useRef } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { TrendingUp, Award, ArrowRight, Plus } from 'lucide-react-native'
import { BarChart, PieChart } from 'react-native-gifted-charts'
import type BottomSheet from '@gorhom/bottom-sheet'
import { useAuthStore } from '@/store/authStore'
import { useCoupleStore } from '@/store/coupleStore'
import { useExpenses } from '@/hooks/useExpenses'
import { getTotalByUser, getTotalByCategory } from '@/services/expenseService'
import { CATEGORY_META } from '@/constants/categories'
import { formatCurrency } from '@/utils/format'
import { Avatar, Card, Skeleton } from '@/components/ui'
import { ExpenseCard } from '@/features/expenses/ExpenseCard'
import { AddExpenseSheet } from '@/features/expenses/AddExpenseSheet'
import { colors } from '@/theme'

const USER_COLOR    = colors.primary[500]
const PARTNER_COLOR = colors.partner[500]

export default function DashboardScreen() {
  const user    = useAuthStore((s) => s.user)
  const partner = useCoupleStore((s) => s.partner)
  const { expenses, isLoading } = useExpenses()
  const sheetRef = useRef<BottomSheet>(null)

  const userTotal    = useMemo(() => user    ? getTotalByUser(expenses, user.id)    : 0, [expenses, user])
  const partnerTotal = useMemo(() => partner ? getTotalByUser(expenses, partner.id) : 0, [expenses, partner])
  const grandTotal   = userTotal + partnerTotal

  const categoryData = useMemo(() => {
    const totals = getTotalByCategory(expenses)
    return Object.entries(totals)
      .map(([cat, value]) => ({
        value,
        color: CATEGORY_META[cat as keyof typeof CATEGORY_META]?.color ?? colors.muted,
        label: CATEGORY_META[cat as keyof typeof CATEGORY_META]?.label ?? cat,
        emoji: CATEGORY_META[cat as keyof typeof CATEGORY_META]?.emoji ?? '📦',
      }))
      .sort((a, b) => b.value - a.value)
  }, [expenses])

  const barData = [
    { value: userTotal,    label: user?.name.split(' ')[0]    ?? 'Você',        frontColor: USER_COLOR },
    { value: partnerTotal, label: partner?.name.split(' ')[0] ?? 'Parceiro(a)', frontColor: PARTNER_COLOR },
  ]

  const topSpenderName = userTotal >= partnerTotal
    ? (user?.name.split(' ')[0] ?? 'Você')
    : (partner?.name.split(' ')[0] ?? 'Parceiro(a)')
  const topAmount = Math.max(userTotal, partnerTotal)
  const recentExpenses = expenses.slice(0, 5)

  if (isLoading) return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={{ padding: 20, gap: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ gap: 6 }}>
            <Skeleton width={60} height={12} />
            <Skeleton width={130} height={28} borderRadius={6} />
          </View>
          <Skeleton width={44} height={44} borderRadius={22} />
        </View>
        <Skeleton height={152} borderRadius={24} />
        <Skeleton height={64} borderRadius={16} />
        <Skeleton height={180} borderRadius={16} />
        <Skeleton height={200} borderRadius={16} />
        <View style={{ gap: 8 }}>
          <Skeleton width={120} height={14} />
          {[0, 1, 2].map((i) => <Skeleton key={i} height={68} borderRadius={14} />)}
        </View>
      </View>
    </SafeAreaView>
  )

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá,</Text>
            <Text style={styles.userName}>{user?.name.split(' ')[0]} 👋</Text>
          </View>
          {user && <Avatar name={user.name} size="lg" variant="you" />}
        </View>

        {/* Total card */}
        <LinearGradient
          colors={['#FF4D8D', '#9B6CFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.totalCard}
        >
          <Text style={styles.totalLabel}>Total do casal este mês</Text>
          <Text style={styles.totalAmount}>{formatCurrency(grandTotal)}</Text>
          <View style={styles.totalMeta}>
            <TrendingUp size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.totalMetaText}>{expenses.length} transações este mês</Text>
          </View>

          {grandTotal > 0 && (
            <>
              <View style={styles.progressBar}>
                <View style={[styles.progressYou, { flex: userTotal / grandTotal }]} />
                <View style={[styles.progressPartner, { flex: partnerTotal / grandTotal }]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>
                  {user?.name.split(' ')[0]}: {formatCurrency(userTotal)}
                </Text>
                <Text style={styles.progressLabel}>
                  {partner?.name.split(' ')[0] ?? 'Parceiro(a)'}: {formatCurrency(partnerTotal)}
                </Text>
              </View>
            </>
          )}
        </LinearGradient>

        {/* Who spent more */}
        {grandTotal > 0 && (
          <Card padding="md">
            <View style={styles.topSpender}>
              <View style={styles.awardBox}>
                <Award size={20} color="#F5A623" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.topSpenderLabel}>Quem gastou mais</Text>
                <Text style={styles.topSpenderName}>
                  {topSpenderName}{' '}
                  <Text style={styles.topSpenderAmount}>— {formatCurrency(topAmount)}</Text>
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Bar chart */}
        <Card padding="lg">
          <Text style={styles.sectionTitle}>Comparação de gastos</Text>
          <BarChart
            data={barData}
            barWidth={56}
            spacing={32}
            roundedTop
            hideRules
            hideYAxisText
            xAxisLabelTextStyle={{ fontSize: 11, color: colors.muted, fontFamily: 'Inter_500Medium' }}
            noOfSections={4}
            maxValue={Math.max(grandTotal, 10)}
            width={240}
            xAxisColor={colors.rim}
            yAxisColor={colors.rim}
            backgroundColor={colors.surface}
          />
        </Card>

        {/* Donut chart */}
        <Card padding="lg">
          <Text style={styles.sectionTitle}>Gastos por categoria</Text>
          {categoryData.length > 0 ? (
            <View style={styles.donutRow}>
              <PieChart
                data={categoryData}
                donut
                innerRadius={50}
                radius={76}
                centerLabelComponent={() => (
                  <Text style={styles.donutCenter}>{categoryData.length} cat.</Text>
                )}
              />
              <View style={styles.legend}>
                {categoryData.slice(0, 5).map((cat) => (
                  <View key={cat.label} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                    <Text style={styles.legendLabel} numberOfLines={1}>
                      {cat.emoji} {cat.label}
                    </Text>
                    <Text style={styles.legendValue}>{formatCurrency(cat.value)}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text style={styles.emptyChart}>Nenhum gasto ainda.</Text>
          )}
        </Card>

        {/* Recent expenses */}
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimos gastos</Text>
            <Pressable
              onPress={() => router.push('/(app)/expenses')}
              style={styles.seeAll}
            >
              <Text style={styles.seeAllText}>Ver todos</Text>
              <ArrowRight size={12} color={colors.primary[500]} />
            </Pressable>
          </View>

          {recentExpenses.length > 0 ? (
            <View style={{ gap: 8 }}>
              {recentExpenses.map((expense) => {
                const expUser = expense.userId === user?.id ? user : partner
                const isOwner = expense.userId === user?.id
                return (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    user={expUser}
                    isOwner={isOwner}
                  />
                )
              })}
            </View>
          ) : (
            <Card padding="md">
              <Text style={styles.emptyText}>Adicione seu primeiro gasto com o botão +</Text>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => sheetRef.current?.expand()}
        style={styles.fab}
      >
        <LinearGradient
          colors={['#FF4D8D', '#9B6CFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Plus size={26} color="#fff" />
        </LinearGradient>
      </Pressable>

      <AddExpenseSheet ref={sheetRef} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: '#0F0E17' },
  scroll:          { padding: 20, gap: 16, paddingBottom: 100 },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting:        { fontSize: 13, color: '#9B97B2', fontFamily: 'Inter_400Regular' },
  userName:        { fontSize: 24, color: '#F0EEF8', fontFamily: 'Inter_900Black' },
  totalCard:       { borderRadius: 24, padding: 24 },
  totalLabel:      { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter_500Medium' },
  totalAmount:     { fontSize: 36, color: '#fff', fontFamily: 'Inter_900Black', marginTop: 4 },
  totalMeta:       { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  totalMetaText:   { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter_400Regular' },
  progressBar:     { flexDirection: 'row', height: 6, borderRadius: 4, overflow: 'hidden', marginTop: 16, backgroundColor: 'rgba(255,255,255,0.2)' },
  progressYou:     { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 4 },
  progressPartner: { backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 4 },
  progressLabels:  { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  progressLabel:   { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter_400Regular' },
  topSpender:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  awardBox:        { width: 40, height: 40, backgroundColor: '#F5A62322', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  topSpenderLabel: { fontSize: 11, color: '#9B97B2', fontFamily: 'Inter_400Regular' },
  topSpenderName:  { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#F0EEF8' },
  topSpenderAmount:{ fontFamily: 'Inter_400Regular', color: '#9B97B2' },
  sectionHeader:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle:    { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#F0EEF8', marginBottom: 16 },
  seeAll:          { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAllText:      { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#FF4D8D' },
  donutRow:        { flexDirection: 'row', alignItems: 'center', gap: 16 },
  donutCenter:     { fontSize: 11, fontFamily: 'Inter_700Bold', color: '#9B97B2', textAlign: 'center' },
  legend:          { flex: 1, gap: 8 },
  legendRow:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot:       { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  legendLabel:     { fontSize: 11, color: '#9B97B2', flex: 1, fontFamily: 'Inter_400Regular' },
  legendValue:     { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#F0EEF8' },
  emptyChart:      { fontSize: 13, color: '#9B97B2', textAlign: 'center', paddingVertical: 16, fontFamily: 'Inter_400Regular' },
  emptyText:       { fontSize: 13, color: '#9B97B2', textAlign: 'center', fontFamily: 'Inter_400Regular' },
  fab:             { position: 'absolute', bottom: 88, right: 20 },
  fabGradient:     { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#FF4D8D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 10 },
})
