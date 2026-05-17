import { forwardRef, useCallback, useMemo } from 'react'
import { View, Text, Switch, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
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
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
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
        backgroundStyle={{ backgroundColor: '#fff', borderRadius: 28 }}
        handleIndicatorStyle={{ backgroundColor: colors.gray[300], width: 40 }}
        keyboardBehavior={Platform.OS === 'ios' ? 'extend' : 'interactive'}
        keyboardBlurBehavior="restore"
      >
        <BottomSheetScrollView
          contentContainerStyle={{ padding: 24, gap: 20, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-xl font-black text-gray-900">Novo gasto</Text>

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
            <Text className="text-sm font-semibold text-gray-700 mb-2">Categoria</Text>
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
              <View className="flex-row items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                <View>
                  <Text className="text-sm font-semibold text-gray-800">Recorrente</Text>
                  <Text className="text-xs text-gray-400">Gasto fixo mensal</Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: colors.gray[200], true: colors.primary[500] }}
                  thumbColor={colors.white}
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
