import { View, Text, StyleSheet } from 'react-native'

interface BadgeProps {
  label: string
  color?: string
  emoji?: string
}

export function Badge({ label, color = '#FF4D8D', emoji }: BadgeProps) {
  return (
    <View style={[styles.container, { backgroundColor: color + '25' }]}>
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  emoji:   { fontSize: 11 },
  label:   { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
})
