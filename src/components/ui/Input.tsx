import { View, Text, TextInput, TextInputProps } from 'react-native'
import { colors } from '@/theme'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function Input({ label, error, leftIcon, rightIcon, ...props }: InputProps) {
  return (
    <View className="gap-1.5">
      {label && (
        <Text className="text-sm font-semibold text-gray-700">{label}</Text>
      )}
      <View
        className={[
          'flex-row items-center bg-gray-50 rounded-2xl border px-4 gap-3',
          error ? 'border-red-400' : 'border-gray-200',
        ].join(' ')}
      >
        {leftIcon && <View>{leftIcon}</View>}
        <TextInput
          className="flex-1 py-3.5 text-base text-gray-900"
          placeholderTextColor={colors.gray[400]}
          style={{ fontFamily: 'Inter_400Regular' }}
          {...props}
        />
        {rightIcon && <View>{rightIcon}</View>}
      </View>
      {error && <Text className="text-xs text-red-500 ml-1">{error}</Text>}
    </View>
  )
}
