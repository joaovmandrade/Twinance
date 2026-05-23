import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native'
import { CATEGORY_META, EXPENSE_CATEGORIES } from '@/constants/categories'
import type { ExpenseCategory } from '@/types'

interface CategoryPickerProps {
  value: ExpenseCategory
  onChange: (cat: ExpenseCategory) => void
}

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
      <View style={styles.row}>
        {EXPENSE_CATEGORIES.map((cat) => {
          const meta   = CATEGORY_META[cat]
          const active = value === cat
          return (
            <Pressable
              key={cat}
              onPress={() => onChange(cat)}
              style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
            >
              <Text style={styles.emoji}>{meta.emoji}</Text>
              <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
                {meta.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  row:          { flexDirection: 'row', gap: 8, paddingHorizontal: 4, paddingBottom: 4 },
  chip:         { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, borderWidth: 1 },
  chipActive:   { backgroundColor: '#2D1624', borderColor: '#FF4D8D' },
  chipInactive: { backgroundColor: '#221F32', borderColor: '#2D2A3E' },
  emoji:        { fontSize: 15 },
  label:        { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  labelActive:  { color: '#FF4D8D' },
  labelInactive:{ color: '#9B97B2' },
})
