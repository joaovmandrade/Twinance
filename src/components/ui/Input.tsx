import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native'
import { colors } from '@/theme'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function Input({ label, error, leftIcon, rightIcon, ...props }: InputProps) {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.container, error ? styles.containerError : styles.containerNormal]}>
        {leftIcon && <View>{leftIcon}</View>}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.muted}
          {...props}
        />
        {rightIcon && <View>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper:         { gap: 6 },
  label:           { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#B8B4CC' },
  container:       {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#221F32',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    gap: 10,
  },
  containerNormal: { borderColor: '#2D2A3E' },
  containerError:  { borderColor: '#FF5170' },
  input:           {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#F0EEF8',
    fontFamily: 'Inter_400Regular',
  },
  error:           { fontSize: 12, color: '#FF5170', marginLeft: 4 },
})
