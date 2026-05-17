import { View, Text, Image } from 'react-native'
import { getInitials } from '@/utils/format'
import { colors } from '@/theme'

type Size = 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  name: string
  uri?: string
  size?: Size
}

const sizeMap: Record<Size, { container: number; text: string }> = {
  sm: { container: 32, text: 'text-xs' },
  md: { container: 40, text: 'text-sm' },
  lg: { container: 48, text: 'text-base' },
  xl: { container: 64, text: 'text-xl' },
}

export function Avatar({ name, uri, size = 'md' }: AvatarProps) {
  const { container, text } = sizeMap[size]
  const initials = getInitials(name)

  return (
    <View
      style={{
        width: container,
        height: container,
        borderRadius: container / 2,
        backgroundColor: colors.primary[100],
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: container, height: container }} />
      ) : (
        <Text className={['font-bold text-primary-700', text].join(' ')}>{initials}</Text>
      )}
    </View>
  )
}
