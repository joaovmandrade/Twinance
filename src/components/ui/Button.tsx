import { Pressable, Text, ActivityIndicator, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { colors } from '@/theme'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps {
  onPress: () => void
  label: string
  variant?: Variant
  size?: Size
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  icon?: React.ReactNode
}

const variantStyles: Record<Variant, { container: string; text: string }> = {
  primary:   { container: 'bg-primary-600 active:bg-primary-700', text: 'text-white font-bold' },
  secondary: { container: 'bg-primary-100 active:bg-primary-200', text: 'text-primary-700 font-bold' },
  ghost:     { container: 'bg-transparent active:bg-gray-100', text: 'text-gray-700 font-semibold' },
  danger:    { container: 'bg-red-500 active:bg-red-600', text: 'text-white font-bold' },
}

const sizeStyles: Record<Size, { container: string; text: string }> = {
  sm: { container: 'px-4 py-2.5 rounded-xl', text: 'text-sm' },
  md: { container: 'px-5 py-3.5 rounded-2xl', text: 'text-base' },
  lg: { container: 'px-6 py-4 rounded-2xl',   text: 'text-lg' },
}

export function Button({
  onPress,
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
}: ButtonProps) {
  const { container, text } = variantStyles[variant]
  const { container: sc, text: st } = sizeStyles[size]
  const isDisabled = disabled || loading

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress()
      }}
      disabled={isDisabled}
      className={[
        'flex-row items-center justify-center gap-2',
        container,
        sc,
        fullWidth && 'w-full',
        isDisabled && 'opacity-50',
      ].filter(Boolean).join(' ')}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? colors.white : colors.primary[600]}
        />
      ) : (
        <>
          {icon && <View>{icon}</View>}
          <Text className={[text, st].join(' ')}>{label}</Text>
        </>
      )}
    </Pressable>
  )
}
