import { ScrollView, View, Text, Pressable } from 'react-native'
import { CATEGORY_META, EXPENSE_CATEGORIES } from '@/constants/categories'
import type { ExpenseCategory } from '@/types'

interface CategoryPickerProps {
  value: ExpenseCategory
  onChange: (cat: ExpenseCategory) => void
}

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
      <View className="flex-row gap-2 px-1 pb-1">
        {EXPENSE_CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat]
          const active = value === cat
          return (
            <Pressable
              key={cat}
              onPress={() => onChange(cat)}
              className={[
                'flex-row items-center gap-2 px-3 py-2 rounded-2xl border',
                active ? 'border-primary-600 bg-primary-50' : 'border-gray-200 bg-white',
              ].join(' ')}
            >
              <Text className="text-base">{meta.emoji}</Text>
              <Text
                className={['text-xs font-semibold', active ? 'text-primary-700' : 'text-gray-600'].join(' ')}
              >
                {meta.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </ScrollView>
  )
}
