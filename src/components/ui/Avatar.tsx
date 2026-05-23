import { View, Text, Image, StyleSheet } from 'react-native'
import { getInitials } from '@/utils/format'

type Size    = 'sm' | 'md' | 'lg' | 'xl'
type Variant = 'you' | 'partner' | 'default'

interface AvatarProps {
  name: string
  uri?: string
  size?: Size
  variant?: Variant
}

const sizeMap: Record<Size, number> = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
}

const fontSizeMap: Record<Size, number> = {
  sm: 11,
  md: 13,
  lg: 15,
  xl: 20,
}

const variantColors: Record<Variant, { bg: string; text: string }> = {
  you:     { bg: '#2D1624', text: '#FF4D8D' },
  partner: { bg: '#1E1535', text: '#9B6CFF' },
  default: { bg: '#2D1624', text: '#FF4D8D' },
}

export function Avatar({ name, uri, size = 'md', variant = 'default' }: AvatarProps) {
  const dim      = sizeMap[size]
  const fSize    = fontSizeMap[size]
  const { bg, text } = variantColors[variant]
  const initials = getInitials(name)

  return (
    <View
      style={[
        styles.base,
        { width: dim, height: dim, borderRadius: dim / 2, backgroundColor: bg },
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: dim, height: dim }} />
      ) : (
        <Text style={{ fontSize: fSize, fontFamily: 'Inter_700Bold', color: text }}>
          {initials}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#2D2A3E',
  },
})
