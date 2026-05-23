import { View, StyleSheet } from 'react-native'
import { Platform } from 'react-native'

type Padding = 'none' | 'sm' | 'md' | 'lg'

interface CardProps {
  children: React.ReactNode
  padding?: Padding
  className?: string
  style?: object
}

const paddingMap: Record<Padding, number> = {
  none: 0,
  sm:   12,
  md:   16,
  lg:   20,
}

const shadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  android: { elevation: 4 },
})

export function Card({ children, padding = 'md', style }: CardProps) {
  return (
    <View style={[styles.card, { padding: paddingMap[padding] }, shadow, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1827',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2D2A3E',
  },
})
