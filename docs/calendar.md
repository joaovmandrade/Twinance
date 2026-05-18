# Twinance — Sistema de Calendário Compartilhado

Calendário focado em casal: eventos emocionais, financeiros e de planejamento compartilhado.

---

## Estrutura de Arquivos

```
supabase/
  schema.sql              ← Tabela events + RLS + índices

backend/src/
  controllers/
    eventController.ts    ← CRUD completo com validação e autorização
  routes/
    events.ts             ← Rotas Express para /api/events
    index.ts              ← Registra eventRoutes

src/
  types/index.ts          ← CalendarEvent, EventType, CalendarEventFormValues
  constants/events.ts     ← EVENT_TYPE_META, EVENT_COLORS, REMINDER_OPTIONS
  constants/config.ts     ← QUERY_KEYS.events, QUERY_KEYS.monthEvents
  services/eventService.ts ← Chamadas HTTP para a API
  hooks/useEvents.ts      ← React Query hooks (useMonthEvents, useAddEvent, …)
  features/calendar/
    EventCard.tsx         ← Card compacto com borda colorida
    MonthView.tsx         ← Grade mensal com dots de evento
    EventModal.tsx        ← Bottom sheet para criar/editar
    UpcomingEvents.tsx    ← Lista agrupada por dia
    index.ts              ← Barrel export

app/(app)/
  calendar.tsx            ← Tela principal do calendário
  _layout.tsx             ← Tab "Calendário" adicionada
```

---

## Banco de Dados — Tabela `events`

| Campo             | Tipo           | Descrição                                      |
|-------------------|----------------|------------------------------------------------|
| id                | uuid           | PK gerado automaticamente                      |
| couple_id         | uuid (FK)      | Referência a `couples` — cascade delete        |
| created_by        | uuid (FK)      | Referência a `auth.users` — cascade delete     |
| title             | text           | Título do evento (obrigatório)                 |
| description       | text           | Descrição livre                                |
| type              | text (enum)    | bill / date / travel / goal / appointment / custom |
| start_date        | timestamptz    | Início do evento (obrigatório)                 |
| end_date          | timestamptz?   | Fim do evento (opcional, para eventos multi-dia) |
| all_day           | boolean        | Se true, ignora horário                        |
| location          | text           | Local do evento                                |
| color             | text           | Hex color para personalização                  |
| amount            | numeric(12,2)? | Valor monetário (contas, metas)                |
| is_recurring      | boolean        | Se repete mensalmente                          |
| reminder_minutes  | integer?       | Minutos antes para lembrete                    |
| created_at        | timestamptz    | Data de criação                                |
| updated_at        | timestamptz    | Atualizado automaticamente via trigger         |

### Índices

```sql
idx_events_couple_id    -- filtragem por casal
idx_events_created_by   -- filtragem por criador
idx_events_start_date   -- filtragem por data
idx_events_couple_month -- compound (couple_id, start_date) para queries mensais
```

### RLS Policies

- **SELECT**: membros do casal podem ver todos os eventos do casal
- **INSERT**: membros do casal podem criar eventos (created_by = auth.uid())
- **UPDATE**: somente o criador pode editar
- **DELETE**: somente o criador pode excluir

### Trigger

`on_event_updated` atualiza `updated_at` automaticamente em todo UPDATE.

---

## Tipos de Evento

| Tipo         | Emoji | Cor      | Uso típico                         |
|--------------|-------|----------|------------------------------------|
| bill         | 💸    | #ef4444  | Aluguel, contas fixas, faturas     |
| date         | 💕    | #ec4899  | Jantar, cinema, momentos a dois    |
| travel       | ✈️    | #3b82f6  | Viagens, passeios, férias          |
| goal         | 🎯    | #10b981  | Poupança, metas financeiras        |
| appointment  | 📅    | #8b5cf6  | Consultas médicas, reuniões        |
| custom       | ⭐    | #f59e0b  | Qualquer outro evento              |

---

## Endpoints da API

Todos os endpoints requerem `Authorization: Bearer <token>`.

### `GET /api/events`

Lista eventos do casal com filtros opcionais.

**Query params:**
- `startDate` — ISO string (ex: `2026-05-01T00:00:00Z`)
- `endDate`   — ISO string
- `type`      — um dos tipos válidos

**Response:** `CalendarEvent[]`

---

### `GET /api/events/month?year=2026&month=5`

Retorna eventos que se sobrepõem ao mês especificado (inclui eventos multi-dia).

**Query params:**
- `year`  — número (ex: `2026`)
- `month` — número 1-12 (ex: `5` = maio)

**Response:** `CalendarEvent[]`

---

### `POST /api/events`

Cria um novo evento.

**Body:**
```json
{
  "title": "Jantar romântico",
  "type": "date",
  "startDate": "2026-05-20T19:00:00.000Z",
  "endDate": "2026-05-20T22:00:00.000Z",
  "allDay": false,
  "location": "Restaurante Le Jardin",
  "color": "#ec4899",
  "description": "Aniversário de 2 anos juntos",
  "isRecurring": false,
  "reminderMinutes": 60
}
```

**Response:** `CalendarEvent` (201)

---

### `PUT /api/events/:id`

Atualiza evento (somente criador). Aceita qualquer subconjunto dos campos.

**Response:** `CalendarEvent` (200)

---

### `DELETE /api/events/:id`

Remove evento (somente criador).

**Response:** 204 No Content

---

## Fluxo de Dados

```
Usuário navega para /calendar
    │
    ├─► useMonthEvents(year, month)
    │       └─► GET /api/events/month?year=X&month=Y
    │               └─► eventController.getMonthEvents
    │                       └─► supabase.events (filtro overlap)
    │
    ├─► MonthView exibe grade com dots de eventos
    │
    ├─► Usuário seleciona dia → selectedDayEvents filtra no cliente
    │
    └─► Usuário toca + → EventModal.open()
            └─► useAddEvent.mutate(formValues)
                    └─► POST /api/events
                            └─► React Query invalida cache
                                    └─► UI atualiza automaticamente
```

---

## Como Expandir

### Notificações Push

O campo `reminder_minutes` está pronto para integração. Para ativar:
1. Instalar `expo-notifications`
2. Criar um job no backend que lê eventos com `reminder_minutes NOT NULL`
3. Disparar push notification `N` minutos antes do `start_date`

### Vincular a Despesas

O campo `amount` já existe. Para criar uma despesa automaticamente a partir de um evento `bill`:
1. No backend, após criar o evento, chamar `expenseService.createFromEvent(event)`
2. Usar `couple_id` e `created_by` do evento como base

### Metas Financeiras

Eventos do tipo `goal` com `amount` representam metas. Para tracking:
1. Criar tabela `goal_contributions(goal_event_id, amount, date)`
2. Endpoint `POST /api/events/:id/contribute`

### Viagens Multi-dia

Eventos `travel` com `start_date` e `end_date` distintos. Para exibir no calendário como barra contínua:
1. No `MonthView`, detectar eventos com `end_date`
2. Renderizar uma linha horizontal entre `start_date` e `end_date`

### Lazy Loading por Mês

O hook `useMonthEvents(year, month)` já implementa cache por chave `['events', 'month', year, month]`. O React Query mantém os dados dos meses visitados em memória durante a sessão.

### Performance

- `staleTime: 60_000` no React Query evita refetch desnecessário dentro de 1 minuto
- Compound index `idx_events_couple_month` acelera queries mensais
- Computed values (`selectedDayEvents`, `upcomingEvents`) usam `useMemo`
