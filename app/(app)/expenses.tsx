import { useMemo, useRef, useState } from 'react'
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { FlashList } from '@shopify/flash-list'
import { SlidersHorizontal, Plus, Receipt } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import type BottomSheet from '@gorhom/bottom-sheet'
import { useAuthStore } from '@/store/authStore'
import { useCoupleStore } from '@/store/coupleStore'
import { useExpenses, useDeleteExpense } from '@/hooks/useExpenses'
import { CATEGORY_META, EXPENSE_CATEGORIES } from '@/constants/categories'
import { formatCurrency } from '@/utils/format'
import { Input, Skeleton } from '@/components/ui'
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

  const [search,       setSearch]       = useState('')
  const [catFilter,    setCatFilter]    = useState<'all' | ExpenseCategory>('all')
  const [personFilter, setPersonFilter] = useState<PersonFilter>('all')
  const [showFilters,  setShowFilters]  = useState(false)

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
      <View style={{ marginHorizontal: 20, marginBottom: 8 }}>
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
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.headerArea}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Gastos</Text>
          <Pressable
            onPress={() => setShowFilters((v) => !v)}
            style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
          >
            <SlidersHorizontal size={14} color={showFilters ? '#fff' : colors.muted} />
            <Text style={[styles.filterBtnText, showFilters && styles.filterBtnTextActive]}>
              Filtros
            </Text>
          </Pressable>
        </View>

        <Input
          placeholder="Buscar gastos..."
          value={search}
          onChangeText={setSearch}
        />

        {showFilters && (
          <View style={styles.filterPanel}>
            <View>
              <Text style={styles.filterSectionLabel}>Categoria</Text>
              <View style={styles.filterChips}>
                <Pressable
                  onPress={() => setCatFilter('all')}
                  style={[styles.chip, catFilter === 'all' && styles.chipActive]}
                >
                  <Text style={[styles.chipText, catFilter === 'all' && styles.chipTextActive]}>
                    Todas
                  </Text>
                </Pressable>
                {EXPENSE_CATEGORIES.map((cat) => {
                  const meta   = CATEGORY_META[cat]
                  const active = catFilter === cat
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setCatFilter(cat)}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {meta.emoji} {meta.label}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>

            <View>
              <Text style={styles.filterSectionLabel}>Pessoa</Text>
              <View style={styles.filterRow}>
                {personOptions.map((opt) => {
                  const active = personFilter === opt.value
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => setPersonFilter(opt.value)}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>
          </View>
        )}

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryCount}>{filtered.length} gastos</Text>
          <Text style={styles.summaryTotal}>{formatCurrency(total)}</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 4, gap: 10 }}>
          {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={72} borderRadius={14} />)}
        </View>
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
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Receipt size={28} color={colors.muted} />
          </View>
          <Text style={styles.emptyTitle}>Nenhum gasto encontrado</Text>
          <Text style={styles.emptySubtitle}>
            {search || catFilter !== 'all' || personFilter !== 'all'
              ? 'Tente outros filtros'
              : 'Adicione seu primeiro gasto com o botão +'}
          </Text>
        </View>
      )}

      {/* FAB */}
      <Pressable onPress={() => sheetRef.current?.expand()} style={styles.fab}>
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
  safe:             { flex: 1, backgroundColor: '#0F0E17' },
  headerArea:       { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 12 },
  headerRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title:            { fontSize: 26, color: '#F0EEF8', fontFamily: 'Inter_900Black' },
  filterBtn:        { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#221F32', borderWidth: 1, borderColor: '#2D2A3E' },
  filterBtnActive:  { backgroundColor: '#FF4D8D', borderColor: '#FF4D8D' },
  filterBtnText:    { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#9B97B2' },
  filterBtnTextActive: { color: '#fff' },
  filterPanel:      { backgroundColor: '#1A1827', borderRadius: 20, padding: 16, gap: 16, borderWidth: 1, borderColor: '#2D2A3E' },
  filterSectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#9B97B2', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  filterChips:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  filterRow:        { flexDirection: 'row', gap: 6 },
  chip:             { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#221F32', borderWidth: 1, borderColor: '#2D2A3E' },
  chipActive:       { backgroundColor: '#FF4D8D22', borderColor: '#FF4D8D' },
  chipText:         { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#9B97B2' },
  chipTextActive:   { color: '#FF4D8D', fontFamily: 'Inter_600SemiBold' },
  summary:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1A1827', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#2D2A3E' },
  summaryCount:     { fontSize: 13, color: '#9B97B2', fontFamily: 'Inter_400Regular' },
  summaryTotal:     { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#F0EEF8' },
  empty:            { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 80 },
  emptyIcon:        { width: 64, height: 64, backgroundColor: '#221F32', borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2D2A3E' },
  emptyTitle:       { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#9B97B2' },
  emptySubtitle:    { fontSize: 12, color: '#544F68', fontFamily: 'Inter_400Regular', textAlign: 'center' },
  fab:              { position: 'absolute', bottom: 88, right: 20 },
  fabGradient:      { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#FF4D8D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 10 },
})
