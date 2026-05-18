import { forwardRef, useCallback, useMemo, useEffect } from 'react'
import {
  View, Text, Switch, TextInput, Pressable,
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
} from 'react-native'
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { format, parseISO } from 'date-fns'
import { Button, Input } from '@/components/ui'
import { useAddEvent, useUpdateEvent } from '@/hooks/useEvents'
import { EVENT_TYPE_META, EVENT_TYPES, EVENT_COLORS, REMINDER_OPTIONS } from '@/constants/events'
import { colors } from '@/theme'
import type { CalendarEvent, CalendarEventFormValues, EventType } from '@/types'

const schema = z.object({
  title:           z.string().min(1, 'Título obrigatório').max(80),
  description:     z.string().max(200).default(''),
  type:            z.enum(['bill', 'date', 'travel', 'goal', 'appointment', 'custom'] as const),
  startDate:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: AAAA-MM-DD'),
  startTime:       z.string().default('09:00'),
  endDate:         z.string().default(''),
  endTime:         z.string().default(''),
  allDay:          z.boolean().default(false),
  location:        z.string().max(100).default(''),
  color:           z.string().default('#8b5cf6'),
  amount:          z.string().default(''),
  isRecurring:     z.boolean().default(false),
  reminderMinutes: z.number().nullable().default(null),
})

function todayStr() {
  return format(new Date(), 'yyyy-MM-dd')
}

interface EventModalProps {
  event?: CalendarEvent | null
  defaultDate?: string
  onSuccess?: () => void
  onClose?: () => void
}

export const EventModal = forwardRef<BottomSheet, EventModalProps>(
  ({ event, defaultDate, onSuccess, onClose }, ref) => {
    const snapPoints = useMemo(() => ['95%'], [])
    const { mutateAsync: addEvent, isPending: isAdding } = useAddEvent()
    const { mutateAsync: updateEvent, isPending: isUpdating } = useUpdateEvent()
    const isPending = isAdding || isUpdating
    const isEdit = Boolean(event)

    const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<CalendarEventFormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        title: '',
        description: '',
        type: 'date',
        startDate: defaultDate ?? todayStr(),
        startTime: '09:00',
        endDate: '',
        endTime: '',
        allDay: false,
        location: '',
        color: '#8b5cf6',
        amount: '',
        isRecurring: false,
        reminderMinutes: null,
      },
    })

    const allDay   = watch('allDay')
    const type     = watch('type')
    const selColor = watch('color')

    // Sync default color when type changes
    useEffect(() => {
      // Only auto-set color when no event is being edited
    }, [type])

    // Populate form when editing
    useEffect(() => {
      if (event) {
        reset({
          title: event.title,
          description: event.description,
          type: event.type,
          startDate: event.startDate.slice(0, 10),
          startTime: event.allDay ? '09:00' : event.startDate.slice(11, 16),
          endDate: event.endDate ? event.endDate.slice(0, 10) : '',
          endTime: event.endDate && !event.allDay ? event.endDate.slice(11, 16) : '',
          allDay: event.allDay,
          location: event.location,
          color: event.color,
          amount: event.amount !== null ? String(event.amount) : '',
          isRecurring: event.isRecurring,
          reminderMinutes: event.reminderMinutes,
        })
      } else {
        reset({
          title: '',
          description: '',
          type: 'date',
          startDate: defaultDate ?? todayStr(),
          startTime: '09:00',
          endDate: '',
          endTime: '',
          allDay: false,
          location: '',
          color: '#8b5cf6',
          amount: '',
          isRecurring: false,
          reminderMinutes: null,
        })
      }
    }, [event, defaultDate, reset])

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
      ),
      [],
    )

    async function onSubmit(values: CalendarEventFormValues) {
      if (isEdit && event) {
        await updateEvent({ id: event.id, values })
      } else {
        await addEvent(values)
      }
      reset()
      ;(ref as React.RefObject<BottomSheet>)?.current?.close()
      onSuccess?.()
    }

    function handleClose() {
      ;(ref as React.RefObject<BottomSheet>)?.current?.close()
      onClose?.()
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
          contentContainerStyle={{ padding: 24, gap: 20, paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-black text-gray-900">
              {isEdit ? 'Editar Evento' : 'Novo Evento'}
            </Text>
            <Pressable
              onPress={handleClose}
              className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
            >
              <X size={18} color={colors.gray[600]} />
            </Pressable>
          </View>

          {/* Type selector */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-gray-700">Tipo de evento</Text>
            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {EVENT_TYPES.map((t) => {
                      const meta = EVENT_TYPE_META[t]
                      const active = value === t
                      return (
                        <Pressable
                          key={t}
                          onPress={() => {
                            Haptics.selectionAsync()
                            onChange(t)
                          }}
                          className="flex-row items-center gap-1.5 px-3 py-2 rounded-full"
                          style={{
                            backgroundColor: active ? meta.color : meta.color + '15',
                            borderWidth: active ? 0 : 1,
                            borderColor: meta.color + '40',
                          }}
                        >
                          <Text style={{ fontSize: 14 }}>{meta.emoji}</Text>
                          <Text
                            className="text-xs font-bold"
                            style={{ color: active ? '#fff' : meta.color }}
                          >
                            {meta.label}
                          </Text>
                        </Pressable>
                      )
                    })}
                  </View>
                </ScrollView>
              )}
            />
          </View>

          {/* Title */}
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Título"
                placeholder="Ex: Jantar romântico, Aluguel..."
                value={value}
                onChangeText={onChange}
                error={errors.title?.message}
              />
            )}
          />

          {/* All day toggle */}
          <Controller
            control={control}
            name="allDay"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                <View>
                  <Text className="text-sm font-semibold text-gray-800">Dia todo</Text>
                  <Text className="text-xs text-gray-400">Sem horário definido</Text>
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

          {/* Date & Time */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-gray-700">Data</Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Início (AAAA-MM-DD)"
                      placeholder={todayStr()}
                      value={value}
                      onChangeText={onChange}
                      keyboardType="numbers-and-punctuation"
                      error={errors.startDate?.message}
                    />
                  )}
                />
              </View>
              {!allDay && (
                <View style={{ width: 90 }}>
                  <Controller
                    control={control}
                    name="startTime"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="Hora"
                        placeholder="09:00"
                        value={value}
                        onChangeText={onChange}
                        keyboardType="numbers-and-punctuation"
                      />
                    )}
                  />
                </View>
              )}
            </View>

            {/* End date (optional) */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Fim (opcional)"
                      placeholder={todayStr()}
                      value={value}
                      onChangeText={onChange}
                      keyboardType="numbers-and-punctuation"
                    />
                  )}
                />
              </View>
              {!allDay && (
                <View style={{ width: 90 }}>
                  <Controller
                    control={control}
                    name="endTime"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="Hora"
                        placeholder="23:59"
                        value={value}
                        onChangeText={onChange}
                        keyboardType="numbers-and-punctuation"
                      />
                    )}
                  />
                </View>
              )}
            </View>
          </View>

          {/* Amount (for bills/goals) */}
          {(type === 'bill' || type === 'goal') && (
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={type === 'bill' ? 'Valor da conta (R$)' : 'Valor da meta (R$)'}
                  placeholder="0,00"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="decimal-pad"
                />
              )}
            />
          )}

          {/* Location */}
          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Local (opcional)"
                placeholder="Ex: Restaurante Le Jardin..."
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          {/* Description */}
          <View className="gap-1.5">
            <Text className="text-sm font-semibold text-gray-700">Descrição (opcional)</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Adicione detalhes..."
                  placeholderTextColor={colors.gray[400]}
                  multiline
                  numberOfLines={3}
                  style={[
                    styles.textarea,
                    { color: colors.gray[800], backgroundColor: colors.gray[50] },
                  ]}
                />
              )}
            />
          </View>

          {/* Color picker */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-gray-700">Cor do evento</Text>
            <Controller
              control={control}
              name="color"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row gap-3 flex-wrap">
                  {EVENT_COLORS.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => {
                        Haptics.selectionAsync()
                        onChange(c)
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: c,
                        borderWidth: value === c ? 3 : 0,
                        borderColor: '#fff',
                        elevation: value === c ? 4 : 1,
                        shadowColor: c,
                        shadowOpacity: value === c ? 0.5 : 0.2,
                        shadowRadius: value === c ? 6 : 3,
                        shadowOffset: { width: 0, height: 2 },
                      }}
                    />
                  ))}
                </View>
              )}
            />
          </View>

          {/* Recurring */}
          <Controller
            control={control}
            name="isRecurring"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                <View>
                  <Text className="text-sm font-semibold text-gray-800">Recorrente</Text>
                  <Text className="text-xs text-gray-400">Repete mensalmente</Text>
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

          {/* Reminder */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-gray-700">Lembrete</Text>
            <Controller
              control={control}
              name="reminderMinutes"
              render={({ field: { onChange, value } }) => (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {REMINDER_OPTIONS.map((opt) => {
                      const active = value === opt.value
                      return (
                        <Pressable
                          key={opt.value}
                          onPress={() => {
                            Haptics.selectionAsync()
                            onChange(active ? null : opt.value)
                          }}
                          className="px-3 py-2 rounded-full"
                          style={{
                            backgroundColor: active ? colors.primary[600] : colors.gray[100],
                          }}
                        >
                          <Text
                            className="text-xs font-semibold"
                            style={{ color: active ? '#fff' : colors.gray[600] }}
                          >
                            {opt.label}
                          </Text>
                        </Pressable>
                      )
                    })}
                  </View>
                </ScrollView>
              )}
            />
          </View>

          <Button
            label={isEdit ? 'Salvar alterações' : 'Criar evento'}
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

EventModal.displayName = 'EventModal'

const styles = StyleSheet.create({
  textarea: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    minHeight: 80,
    textAlignVertical: 'top',
  },
})
