import { useMemo, useRef } from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
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
import { Avatar, Card, LoadingSpinner } from '@/components/ui'
import { ExpenseCard } from '@/features/expenses/ExpenseCard'
import { AddExpenseSheet } from '@/features/expenses/AddExpenseSheet'
import { colors } from '@/theme'

const USER_COLOR    = colors.primary[600]
const PARTNER_COLOR = colors.primary[300]

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
        color: CATEGORY_META[cat as keyof typeof CATEGORY_META]?.color ?? '#94a3b8',
        label: CATEGORY_META[cat as keyof typeof CATEGORY_META]?.label ?? cat,
        emoji: CATEGORY_META[cat as keyof typeof CATEGORY_META]?.emoji ?? '📦',
      }))
      .sort((a, b) => b.value - a.value)
  }, [expenses])

  const barData = [
    { value: userTotal,    label: user?.name.split(' ')[0]    ?? 'Você',       frontColor: USER_COLOR },
    { value: partnerTotal, label: partner?.name.split(' ')[0] ?? 'Parceiro(a)', frontColor: PARTNER_COLOR },
  ]

  const topSpenderName = userTotal >= partnerTotal
    ? (user?.name.split(' ')[0] ?? 'Você')
    : (partner?.name.split(' ')[0] ?? 'Parceiro(a)')
  const topAmount = Math.max(userTotal, partnerTotal)

  const recentExpenses = expenses.slice(0, 5)

  if (isLoading) return <LoadingSpinner fullScreen />

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-gray-500" style={{ fontFamily: 'Inter_400Regular' }}>
              Olá,
            </Text>
            <Text className="text-2xl text-gray-900" style={{ fontFamily: 'Inter_900Black' }}>
              {user?.name.split(' ')[0]} 👋
            </Text>
          </View>
          {user && <Avatar name={user.name} size="lg" />}
        </View>

        {/* Total card */}
        <LinearGradient
          colors={[colors.primary[600], colors.primary[800]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 28, padding: 24 }}
        >
          <Text className="text-sm text-primary-200" style={{ fontFamily: 'Inter_500Medium' }}>
            Total do casal este mês
          </Text>
          <Text className="text-4xl text-white mt-1" style={{ fontFamily: 'Inter_900Black' }}>
            {formatCurrency(grandTotal)}
          </Text>
          <View className="flex-row items-center gap-2 mt-3">
            <TrendingUp size={14} color={colors.primary[300]} />
            <Text className="text-xs text-primary-300">
              {expenses.length} transações este mês
            </Text>
          </View>

          {grandTotal > 0 && (
            <>
              <View className="flex-row gap-1 h-2 rounded-full overflow-hidden mt-4 bg-white/20">
                <View
                  className="bg-white/90 rounded-full"
                  style={{ flex: userTotal / grandTotal }}
                />
                <View
                  className="bg-white/40 rounded-full"
                  style={{ flex: partnerTotal / grandTotal }}
                />
              </View>
              <View className="flex-row justify-between mt-1.5">
                <Text className="text-xs text-primary-200">
                  {user?.name.split(' ')[0]}: {formatCurrency(userTotal)}
                </Text>
                <Text className="text-xs text-primary-200">
                  {partner?.name.split(' ')[0] ?? 'Parceiro(a)'}: {formatCurrency(partnerTotal)}
                </Text>
              </View>
            </>
          )}
        </LinearGradient>

        {/* Who spent more */}
        {grandTotal > 0 && (
          <Card padding="md">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-amber-100 rounded-2xl items-center justify-center">
                <Award size={20} color="#d97706" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500">Quem gastou mais</Text>
                <Text className="text-sm font-bold text-gray-900">
                  {topSpenderName}{' '}
                  <Text className="font-normal text-gray-500">— {formatCurrency(topAmount)}</Text>
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Bar chart */}
        <Card padding="lg">
          <Text className="text-sm font-bold text-gray-800 mb-4">Comparação de gastos</Text>
          <BarChart
            data={barData}
            barWidth={56}
            spacing={32}
            roundedTop
            hideRules
            hideYAxisText
            xAxisLabelTextStyle={{ fontSize: 11, color: colors.gray[400], fontFamily: 'Inter_500Medium' }}
            noOfSections={4}
            maxValue={Math.max(grandTotal, 10)}
            width={240}
          />
        </Card>

        {/* Donut chart */}
        <Card padding="lg">
          <Text className="text-sm font-bold text-gray-800 mb-4">Gastos por categoria</Text>
          {categoryData.length > 0 ? (
            <View className="flex-row items-center gap-4">
              <PieChart
                data={categoryData}
                donut
                innerRadius={50}
                radius={76}
                centerLabelComponent={() => (
                  <Text className="text-xs font-bold text-gray-500">
                    {categoryData.length} cat.
                  </Text>
                )}
              />
              <View className="flex-1 gap-2">
                {categoryData.slice(0, 5).map((cat) => (
                  <View key={cat.label} className="flex-row items-center gap-2">
                    <View
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <Text className="text-xs text-gray-600 flex-1" numberOfLines={1}>
                      {cat.emoji} {cat.label}
                    </Text>
                    <Text className="text-xs font-semibold text-gray-800">
                      {formatCurrency(cat.value)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text className="text-sm text-gray-400 text-center py-4">
              Nenhum gasto ainda.
            </Text>
          )}
        </Card>

        {/* Recent expenses */}
        <View>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-bold text-gray-800">Últimos gastos</Text>
            <Pressable
              onPress={() => router.push('/(app)/expenses')}
              className="flex-row items-center gap-1"
            >
              <Text className="text-xs font-semibold text-primary-600">Ver todos</Text>
              <ArrowRight size={12} color={colors.primary[600]} />
            </Pressable>
          </View>

          {recentExpenses.length > 0 ? (
            <View className="gap-2">
              {recentExpenses.map((expense) => {
                const expUser = expense.userId === user?.id ? user : partner
                return (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    user={expUser}
                    isOwner={expense.userId === user?.id}
                  />
                )
              })}
            </View>
          ) : (
            <Card padding="md">
              <Text className="text-sm text-gray-400 text-center">
                Adicione seu primeiro gasto com o botão +
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => sheetRef.current?.expand()}
        className="absolute bottom-24 right-6 w-14 h-14 bg-primary-600 rounded-full items-center justify-center"
        style={{ shadowColor: colors.primary[800], shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }}
      >
        <Plus size={28} color="#fff" />
      </Pressable>

      <AddExpenseSheet ref={sheetRef} />
    </SafeAreaView>
  )
}
