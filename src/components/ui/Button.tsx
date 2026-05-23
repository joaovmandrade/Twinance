import { Pressable, Text, ActivityIndicator, View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
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

const radiusBySize = { sm: 12, md: 16, lg: 16 }
const paddingBySize = {
  sm: { paddingHorizontal: 16, paddingVertical: 10 },
  md: { paddingHorizontal: 20, paddingVertical: 14 },
  lg: { paddingHorizontal: 24, paddingVertical: 16 },
}
const fontSizeBySize = { sm: 14, md: 16, lg: 18 }

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
  const isDisabled = disabled || loading
  const radius = radiusBySize[size]
  const pad    = paddingBySize[size]
  const fSize  = fontSizeBySize[size]

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={handlePress}
        disabled={isDisabled}
        style={[{ opacity: isDisabled ? 0.45 : 1 }, fullWidth && styles.fullWidth]}
      >
        {({ pressed }) => (
          <LinearGradient
            colors={pressed ? ['#E63577', '#7C4AE8'] : ['#FF4D8D', '#9B6CFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.row, { borderRadius: radius, ...pad }]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                {icon && <View>{icon}</View>}
                <Text style={[styles.boldWhite, { fontSize: fSize }]}>{label}</Text>
              </>
            )}
          </LinearGradient>
        )}
      </Pressable>
    )
  }

  const variantMap = {
    secondary: {
      bg:    colors.primary[100],
      bgActive: colors.primary[200],
      color: colors.primary[400],
    },
    ghost: {
      bg:    'transparent',
      bgActive: colors.elevated,
      color: colors.muted,
    },
    danger: {
      bg:    colors.error + 'CC',
      bgActive: colors.error,
      color: '#fff',
    },
  }[variant as 'secondary' | 'ghost' | 'danger']

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.row,
        { borderRadius: radius, ...pad, backgroundColor: pressed ? variantMap.bgActive : variantMap.bg },
        fullWidth && styles.fullWidth,
        isDisabled && { opacity: 0.45 },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantMap.color} />
      ) : (
        <>
          {icon && <View>{icon}</View>}
          <Text style={[styles.boldText, { fontSize: fSize, color: variantMap.color }]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  fullWidth: { width: '100%' },
  boldWhite: { fontFamily: 'Inter_700Bold', color: '#fff' },
  boldText:  { fontFamily: 'Inter_700Bold' },
})
