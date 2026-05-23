import { forwardRef, useCallback, useMemo, useEffect } from 'react'
import {
  View, Text, Switch, TextInput, Pressable,
  Platform, ScrollView, StyleSheet,
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
  color:           z.string().default('#FF4D8D'),
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
    const { mutateAsync: addEvent,    isPending: isAdding   } = useAddEvent()
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
        color: '#FF4D8D',
        amount: '',
        isRecurring: false,
        reminderMinutes: null,
      },
    })

    const allDay   = watch('allDay')
    const type     = watch('type')
    const selColor = watch('color')

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
          color: '#FF4D8D',
          amount: '',
          isRecurring: false,
          reminderMinutes: null,
        })
      }
    }, [event, defaultDate, reset])

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.7} />
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
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
        keyboardBehavior={Platform.OS === 'ios' ? 'extend' : 'interactive'}
        keyboardBlurBehavior="restore"
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>
              {isEdit ? 'Editar Evento' : 'Novo Evento'}
            </Text>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <X size={18} color={colors.muted} />
            </Pressable>
          </View>

          {/* Type selector */}
          <View style={{ gap: 8 }}>
            <Text style={styles.fieldLabel}>Tipo de evento</Text>
            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.typeRow}>
                    {EVENT_TYPES.map((t) => {
                      const meta   = EVENT_TYPE_META[t]
                      const active = value === t
                      return (
                        <Pressable
                          key={t}
                          onPress={() => {
                            Haptics.selectionAsync()
                            onChange(t)
                          }}
                          style={[
                            styles.typeChip,
                            { backgroundColor: active ? meta.color : meta.color + '18', borderColor: active ? meta.color : meta.color + '40' },
                          ]}
                        >
                          <Text style={{ fontSize: 14 }}>{meta.emoji}</Text>
                          <Text style={[styles.typeChipText, { color: active ? '#fff' : meta.color }]}>
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

          <Controller
            control={control}
            name="allDay"
            render={({ field: { onChange, value } }) => (
              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.toggleLabel}>Dia todo</Text>
                  <Text style={styles.toggleSub}>Sem horário definido</Text>
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

          <View style={{ gap: 12 }}>
            <Text style={styles.fieldLabel}>Data</Text>
            <View style={styles.dateRow}>
              <View style={{ flex: 1 }}>
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

            <View style={styles.dateRow}>
              <View style={{ flex: 1 }}>
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

          <View style={{ gap: 8 }}>
            <Text style={styles.fieldLabel}>Descrição (opcional)</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Adicione detalhes..."
                  placeholderTextColor={colors.muted}
                  multiline
                  numberOfLines={3}
                  style={styles.textarea}
                />
              )}
            />
          </View>

          <View style={{ gap: 10 }}>
            <Text style={styles.fieldLabel}>Cor do evento</Text>
            <Controller
              control={control}
              name="color"
              render={({ field: { onChange, value } }) => (
                <View style={styles.colorsRow}>
                  {EVENT_COLORS.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => {
                        Haptics.selectionAsync()
                        onChange(c)
                      }}
                      style={[
                        styles.colorDot,
                        { backgroundColor: c },
                        value === c && { borderWidth: 3, borderColor: colors.onDark },
                      ]}
                    />
                  ))}
                </View>
              )}
            />
          </View>

          <Controller
            control={control}
            name="isRecurring"
            render={({ field: { onChange, value } }) => (
              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.toggleLabel}>Recorrente</Text>
                  <Text style={styles.toggleSub}>Repete mensalmente</Text>
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

          <View style={{ gap: 8 }}>
            <Text style={styles.fieldLabel}>Lembrete</Text>
            <Controller
              control={control}
              name="reminderMinutes"
              render={({ field: { onChange, value } }) => (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.remindersRow}>
                    {REMINDER_OPTIONS.map((opt) => {
                      const active = value === opt.value
                      return (
                        <Pressable
                          key={opt.value}
                          onPress={() => {
                            Haptics.selectionAsync()
                            onChange(active ? null : opt.value)
                          }}
                          style={[
                            styles.reminderChip,
                            { backgroundColor: active ? colors.primary[500] : colors.elevated },
                          ]}
                        >
                          <Text style={[styles.reminderText, { color: active ? '#fff' : colors.muted }]}>
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
  sheetBg:       { backgroundColor: '#1A1827', borderRadius: 28 },
  handle:        { backgroundColor: '#544F68', width: 40 },
  content:       { padding: 24, gap: 20, paddingBottom: 60 },
  sheetHeader:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitle:    { fontSize: 20, fontFamily: 'Inter_900Black', color: '#F0EEF8' },
  closeBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: '#221F32', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2D2A3E' },
  fieldLabel:    { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#B8B4CC' },
  typeRow:       { flexDirection: 'row', gap: 8 },
  typeChip:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  typeChipText:  { fontSize: 12, fontFamily: 'Inter_700Bold' },
  toggleRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#221F32', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#2D2A3E' },
  toggleLabel:   { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#F0EEF8' },
  toggleSub:     { fontSize: 11, color: '#9B97B2', fontFamily: 'Inter_400Regular', marginTop: 2 },
  dateRow:       { flexDirection: 'row', gap: 12 },
  textarea:      { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: 'Inter_400Regular', minHeight: 80, textAlignVertical: 'top', backgroundColor: '#221F32', color: '#F0EEF8', borderWidth: 1, borderColor: '#2D2A3E' },
  colorsRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorDot:      { width: 32, height: 32, borderRadius: 16 },
  remindersRow:  { flexDirection: 'row', gap: 8 },
  reminderChip:  { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  reminderText:  { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
})
