import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Trash2 } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { CATEGORY_META } from '@/constants/categories'
import { formatCurrency, formatDate } from '@/utils/format'
import { colors } from '@/theme'
import type { Expense, User } from '@/types'

interface ExpenseCardProps {
  expense: Expense
  user: User | null
  isOwner?: boolean
  onDelete?: (id: string) => void
}

export function ExpenseCard({ expense, user, isOwner = false, onDelete }: ExpenseCardProps) {
  const meta = CATEGORY_META[expense.category]

  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: meta.color + '20' }]}>
        <Text style={styles.emoji}>{meta.emoji}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description} numberOfLines={1}>{expense.description}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>{meta.label}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.metaText}>{formatDate(expense.date)}</Text>
          {user && (
            <>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.metaText} numberOfLines={1}>{user.name.split(' ')[0]}</Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
        {isOwner && onDelete && (
          <Pressable
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
              onDelete(expense.id)
            }}
            hitSlop={8}
          >
            <Trash2 size={14} color={colors.muted} />
          </Pressable>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card:        { backgroundColor: '#1A1827', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#2D2A3E' },
  iconBox:     { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  emoji:       { fontSize: 20 },
  content:     { flex: 1, minWidth: 0 },
  description: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#F0EEF8' },
  meta:        { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'nowrap' },
  metaText:    { fontSize: 11, color: '#9B97B2', fontFamily: 'Inter_400Regular' },
  dot:         { fontSize: 11, color: '#544F68' },
  right:       { alignItems: 'flex-end', gap: 4 },
  amount:      { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#F0EEF8' },
})
