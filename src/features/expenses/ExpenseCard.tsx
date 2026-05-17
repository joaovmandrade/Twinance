import { View, Text, Pressable } from 'react-native'
import { Trash2 } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { CATEGORY_META } from '@/constants/categories'
import { formatCurrency, formatDate } from '@/utils/format'
import { colors, shadows } from '@/theme'
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
    <View
      className="bg-white rounded-2xl p-4 flex-row items-center gap-3"
      style={shadows.sm}
    >
      <View
        className="w-11 h-11 rounded-2xl items-center justify-center flex-shrink-0"
        style={{ backgroundColor: meta.color + '22' }}
      >
        <Text className="text-xl">{meta.emoji}</Text>
      </View>

      <View className="flex-1 min-w-0">
        <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
          {expense.description}
        </Text>
        <View className="flex-row items-center gap-2 mt-0.5">
          <Text className="text-xs text-gray-400">{meta.label}</Text>
          <Text className="text-gray-200">·</Text>
          <Text className="text-xs text-gray-400">{formatDate(expense.date)}</Text>
          {user && (
            <>
              <Text className="text-gray-200">·</Text>
              <Text className="text-xs text-gray-400" numberOfLines={1}>
                {user.name.split(' ')[0]}
              </Text>
            </>
          )}
        </View>
      </View>

      <View className="items-end gap-1">
        <Text className="text-sm font-bold text-gray-900">
          {formatCurrency(expense.amount)}
        </Text>
        {isOwner && onDelete && (
          <Pressable
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
              onDelete(expense.id)
            }}
            hitSlop={8}
          >
            <Trash2 size={14} color={colors.gray[400]} />
          </Pressable>
        )}
      </View>
    </View>
  )
}
