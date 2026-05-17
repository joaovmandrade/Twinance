import { View, ActivityIndicator } from 'react-native'
import { colors } from '@/theme'

interface LoadingSpinnerProps {
  fullScreen?: boolean
  size?: 'small' | 'large'
}

export function LoadingSpinner({ fullScreen = false, size = 'large' }: LoadingSpinnerProps) {
  return (
    <View className={fullScreen ? 'flex-1 items-center justify-center' : 'items-center justify-center py-10'}>
      <ActivityIndicator size={size} color={colors.primary[600]} />
    </View>
  )
}
