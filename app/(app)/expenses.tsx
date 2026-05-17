import { useMemo, useRef, useState } from 'react'
import { View, Text, Pressable, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlashList } from '@shopify/flash-list'
import { SlidersHorizontal, Plus, Receipt } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import type BottomSheet from '@gorhom/bottom-sheet'
import { useAuthStore } from '@/store/authStore'
import { useCoupleStore } from '@/store/coupleStore'
import { useExpenses, useDeleteExpense } from '@/hooks/useExpenses'
import { CATEGORY_META, EXPENSE_CATEGORIES } from '@/constants/categories'
import { formatCurrency } from '@/utils/format'
import { Input, Badge, LoadingSpinner } from '@/components/ui'
import { ExpenseCard } from '@/features/expenses/ExpenseCard'
import { AddExpenseSheet } from '@/features/expenses/AddExpenseSheet'
import { colors } from '@/theme'
import type { Expense, ExpenseCategory } from '@/types'

type PersonFilter = 'all' | 'me' | 'partner'

export default function ExpensesScreen() {
  const user    = useAuthStore((s) => s.user)
  const partner = useCoupleStore((s) => s.partner)
  const { expenses, isLoading } = useExpenses()
  const { mutate: deleteExpense } = useDeleteExpense()
  const sheetRef = useRef<BottomSheet>(null)

  const [search,     setSearch]     = useState('')
  const [catFilter,  setCatFilter]  = useState<'all' | ExpenseCategory>('all')
  const [personFilter, setPersonFilter] = useState<PersonFilter>('all')
  const [showFilters, setShowFilters]   = useState(false)

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const meta = CATEGORY_META[e.category]
      const matchSearch =
        !search ||
        e.description.toLowerCase().includes(search.toLowerCase()) ||
        meta.label.toLowerCase().includes(search.toLowerCase())
      const matchCat = catFilter === 'all' || e.category === catFilter
      const matchPerson =
        personFilter === 'all' ||
        (personFilter === 'me'      && e.userId === user?.id) ||
        (personFilter === 'partner' && e.userId === partner?.id)
      return matchSearch && matchCat && matchPerson
    })
  }, [expenses, search, catFilter, personFilter, user, partner])

  const total = useMemo(() => filtered.reduce((s, e) => s + e.amount, 0), [filtered])

  function handleDelete(id: string) {
    Alert.alert('Remover gasto', 'Deseja remover este gasto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          deleteExpense(id)
        },
      },
    ])
  }

  const personOptions: { value: PersonFilter; label: string }[] = [
    { value: 'all',     label: 'Todos' },
    { value: 'me',      label: user?.name.split(' ')[0]    ?? 'Eu' },
    { value: 'partner', label: partner?.name.split(' ')[0] ?? 'Parceiro(a)' },
  ]

  function renderItem({ item }: { item: Expense }) {
    const expUser = item.userId === user?.id ? user : partner
    return (
      <View className="mx-5 mb-2">
        <ExpenseCard
          expense={item}
          user={expUser}
          isOwner={item.userId === user?.id}
          onDelete={handleDelete}
        />
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-4 pb-3 gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl text-gray-900" style={{ fontFamily: 'Inter_900Black' }}>
            Gastos
          </Text>
          <Pressable
            onPress={() => setShowFilters((v) => !v)}
            className={[
              'flex-row items-center gap-1.5 rounded-2xl px-3 py-2',
              showFilters ? 'bg-primary-600' : 'bg-white border border-gray-200',
            ].join(' ')}
          >
            <SlidersHorizontal size={14} color={showFilters ? '#fff' : colors.gray[600]} />
            <Text
              className={['text-xs font-semibold', showFilters ? 'text-white' : 'text-gray-600'].join(' ')}
            >
              Filtros
            </Text>
          </Pressable>
        </View>

        <Input
          placeholder="Buscar gastos..."
          value={search}
          onChangeText={setSearch}
        />

        {/* Filters */}
        {showFilters && (
          <View className="bg-white rounded-3xl p-4 gap-4" style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <View>
              <Text className="text-xs font-semibold text-gray-500 mb-2">Categoria</Text>
              <View className="flex-row flex-wrap gap-1.5">
                <Pressable
                  onPress={() => setCatFilter('all')}
                  className={['rounded-full px-3 py-1', catFilter === 'all' ? 'bg-primary-600' : 'bg-gray-100'].join(' ')}
                >
                  <Text className={['text-xs font-medium', catFilter === 'all' ? 'text-white' : 'text-gray-600'].join(' ')}>
                    Todas
                  </Text>
                </Pressable>
                {EXPENSE_CATEGORIES.map((cat) => {
                  const meta = CATEGORY_META[cat]
                  const active = catFilter === cat
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setCatFilter(cat)}
                      className={['rounded-full px-3 py-1', active ? 'bg-primary-600' : 'bg-gray-100'].join(' ')}
                    >
                      <Text className={['text-xs font-medium', active ? 'text-white' : 'text-gray-600'].join(' ')}>
                        {meta.emoji} {meta.label}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>

            <View>
              <Text className="text-xs font-semibold text-gray-500 mb-2">Pessoa</Text>
              <View className="flex-row gap-1.5">
                {personOptions.map((opt) => {
                  const active = personFilter === opt.value
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => setPersonFilter(opt.value)}
                      className={['rounded-full px-3 py-1', active ? 'bg-primary-600' : 'bg-gray-100'].join(' ')}
                    >
                      <Text className={['text-xs font-medium', active ? 'text-white' : 'text-gray-600'].join(' ')}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>
          </View>
        )}

        {/* Summary bar */}
        <View className="flex-row items-center justify-between bg-white rounded-2xl px-4 py-3" style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}>
          <Text className="text-sm text-gray-500">{filtered.length} gastos</Text>
          <Text className="text-sm font-bold text-gray-900">{formatCurrency(total)}</Text>
        </View>
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : filtered.length > 0 ? (
        <FlashList
          data={filtered}
          renderItem={renderItem}
          estimatedItemSize={76}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 96 }}
        />
      ) : (
        <View className="flex-1 items-center justify-center gap-3 pb-20">
          <View className="w-16 h-16 bg-gray-100 rounded-3xl items-center justify-center">
            <Receipt size={28} color={colors.gray[300]} />
          </View>
          <Text className="text-sm font-semibold text-gray-400">Nenhum gasto encontrado</Text>
          <Text className="text-xs text-gray-300">
            {search || catFilter !== 'all' || personFilter !== 'all'
              ? 'Tente outros filtros'
              : 'Adicione seu primeiro gasto com o botão +'}
          </Text>
        </View>
      )}

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
