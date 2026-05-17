import { View, Text } from 'react-native'

interface BadgeProps {
  label: string
  color?: string
  emoji?: string
}

export function Badge({ label, color = '#7c3aed', emoji }: BadgeProps) {
  return (
    <View
      className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
      style={{ backgroundColor: color + '22' }}
    >
      {emoji && <Text className="text-xs">{emoji}</Text>}
      <Text className="text-xs font-semibold" style={{ color }}>{label}</Text>
    </View>
  )
}
