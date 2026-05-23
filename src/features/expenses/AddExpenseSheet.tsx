import { forwardRef, useCallback, useMemo } from 'react'
import { View, Text, Switch, Platform, StyleSheet } from 'react-native'
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Button } from '@/components/ui'
import { CategoryPicker } from './CategoryPicker'
import { useAddExpense } from '@/hooks/useExpenses'
import { todayISO } from '@/utils/format'
import { colors } from '@/theme'
import type { ExpenseFormValues, ExpenseCategory } from '@/types'

const schema = z.object({
  amount: z
    .string()
    .min(1, 'Valor obrigatório')
    .refine((v) => !isNaN(parseFloat(v.replace(',', '.'))), 'Valor inválido'),
  category: z.enum([
    'food', 'transport', 'health', 'entertainment',
    'home', 'shopping', 'education', 'travel', 'pets', 'other',
  ] as const),
  description: z.string().min(1, 'Descrição obrigatória').max(100, 'Máximo 100 caracteres'),
  recurring: z.boolean(),
  date: z.string(),
})

interface AddExpenseSheetProps {
  onSuccess?: () => void
}

export const AddExpenseSheet = forwardRef<BottomSheet, AddExpenseSheetProps>(
  ({ onSuccess }, ref) => {
    const snapPoints = useMemo(() => ['92%'], [])
    const { mutateAsync, isPending } = useAddExpense()

    const { control, handleSubmit, reset, formState: { errors } } = useForm<ExpenseFormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        amount: '',
        category: 'food',
        description: '',
        recurring: false,
        date: todayISO(),
      },
    })

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.7} />
      ),
      [],
    )

    async function onSubmit(values: ExpenseFormValues) {
      await mutateAsync(values)
      reset()
      ;(ref as React.RefObject<BottomSheet>)?.current?.close()
      onSuccess?.()
    }

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
        keyboardBehavior={Platform.OS === 'ios' ? 'extend' : 'interactive'}
        keyboardBlurBehavior="restore"
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sheetTitle}>Novo gasto</Text>

          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Valor (R$)"
                placeholder="0,00"
                value={value}
                onChangeText={onChange}
                keyboardType="decimal-pad"
                error={errors.amount?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Descrição"
                placeholder="Ex: Almoço, Uber, Mercado..."
                value={value}
                onChangeText={onChange}
                error={errors.description?.message}
              />
            )}
          />

          <View>
            <Text style={styles.fieldLabel}>Categoria</Text>
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <CategoryPicker value={value as ExpenseCategory} onChange={onChange} />
              )}
            />
          </View>

          <Controller
            control={control}
            name="date"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Data (AAAA-MM-DD)"
                placeholder={todayISO()}
                value={value}
                onChangeText={onChange}
                error={errors.date?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="recurring"
            render={({ field: { onChange, value } }) => (
              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.toggleLabel}>Recorrente</Text>
                  <Text style={styles.toggleSubtitle}>Gasto fixo mensal</Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: colors.rim, true: colors.primary[500] }}
                  thumbColor={colors.onDark}
                />
              </View>
            )}
          />

          <Button
            label="Adicionar gasto"
            onPress={handleSubmit(onSubmit)}
            loading={isPending}
            fullWidth
            size="lg"
          />
        </BottomSheetScrollView>
      </BottomSheet>
    )
  },
)

AddExpenseSheet.displayName = 'AddExpenseSheet'

const styles = StyleSheet.create({
  sheetBg:      { backgroundColor: '#1A1827', borderRadius: 28 },
  handle:       { backgroundColor: '#544F68', width: 40 },
  content:      { padding: 24, gap: 20, paddingBottom: 48 },
  sheetTitle:   { fontSize: 20, fontFamily: 'Inter_900Black', color: '#F0EEF8' },
  fieldLabel:   { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#B8B4CC', marginBottom: 8 },
  toggleRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#221F32', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#2D2A3E' },
  toggleLabel:  { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#F0EEF8' },
  toggleSubtitle: { fontSize: 11, color: '#9B97B2', fontFamily: 'Inter_400Regular', marginTop: 2 },
})
