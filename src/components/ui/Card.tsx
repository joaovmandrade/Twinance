import { View } from 'react-native'
import { shadows } from '@/theme'

type Padding = 'none' | 'sm' | 'md' | 'lg'

interface CardProps {
  children: React.ReactNode
  padding?: Padding
  className?: string
}

const paddingClasses: Record<Padding, string> = {
  none: '',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-5',
}

export function Card({ children, padding = 'md', className = '' }: CardProps) {
  return (
    <View
      className={['bg-white rounded-3xl', paddingClasses[padding], className].join(' ')}
      style={shadows.md}
    >
      {children}
    </View>
  )
}
