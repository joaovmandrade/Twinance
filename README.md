# Twinance — Mobile

Aplicativo de controle financeiro para casais, migrado de ReactJS/Vite para **React Native + Expo**. "Twinance" une _twin_ (parceiro) e _finance_ (finanças): dois parceiros com visibilidade total sobre os gastos compartilhados.

---

## Ambiente de produção

| Serviço | URL |
|---|---|
| **API (Render)** | https://twinance.onrender.com |
| **Health check** | https://twinance.onrender.com/api/health |
| **Supabase** | https://aphujuayzsstzhikhgoh.supabase.co |

> O backend fica inativo após 15 min sem uso no plano gratuito do Render.
> O primeiro request pode demorar até 30 s (cold start). O app trata isso com timeout de 30 s e retry automático.

---

## Configuração local

```bash
# 1. Instalar dependências
npm install

# 2. Copiar variáveis de ambiente
cp .env.example .env
# .env já vem pré-configurado com a URL de produção do Render

# 3. Iniciar o app
npm start
```

### Variáveis de ambiente (`.env`)

| Variável | Descrição |
|---|---|
| `EXPO_PUBLIC_API_URL` | URL da API — `https://twinance.onrender.com` em produção |
| `EXPO_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Chave pública (anon) do Supabase |

**Para desenvolvimento local contra backend rodando na máquina:**
```bash
# Android emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:3001

# iOS simulator
EXPO_PUBLIC_API_URL=http://localhost:3001

# Dispositivo físico (substitua pelo IP local)
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001
```

---

## Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework mobile | React Native + Expo | SDK 51 |
| Roteamento | Expo Router (file-based) | v3 |
| Estilização | NativeWind (Tailwind no RN) | v4 |
| Estado global | Zustand | v4 |
| Estado servidor | TanStack Query (React Query) | v5 |
| Formulários | React Hook Form + Zod | v7 / v3 |

| Banco de dados / Auth | Supabase | v2 |
| Gráficos | react-native-gifted-charts | v1.4 |
| Listas performáticas | @shopify/flash-list | v1.6 |
| Bottom sheet | @gorhom/bottom-sheet | v4 |
| Animações | React Native Reanimated | v3 |
| Gestos | React Native Gesture Handler | v2 |
| Fontes | @expo-google-fonts/inter | — |
| Backend | Node.js + Express (mantido) | — |

---

## Arquitetura e estrutura de pastas

```
Twinance/
│
├── app/                        # Expo Router — rotas (telas)
│   ├── _layout.tsx             # Root layout: providers, splash, fontes, auth init
│   ├── index.tsx               # Redireciona baseado em estado de auth
│   ├── couple-setup.tsx        # Tela de configuração de casal
│   ├── (auth)/
│   │   ├── _layout.tsx         # Stack sem header
│   │   ├── login.tsx           # Tela de login
│   │   └── register.tsx        # Tela de cadastro
│   └── (app)/
│       ├── _layout.tsx         # Tab navigator (bottom tabs)
│       ├── index.tsx           # Dashboard
│       ├── expenses.tsx        # Lista de gastos
│       └── profile.tsx         # Perfil do usuário
│
├── src/                        # Todo o código-fonte (não são rotas)
│   ├── components/
│   │   └── ui/                 # Componentes genéricos reutilizáveis
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Card.tsx
│   │       ├── Avatar.tsx
│   │       ├── Badge.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── index.ts
│   │
│   ├── features/               # Componentes específicos de domínio
│   │   └── expenses/
│   │       ├── ExpenseCard.tsx         # Card de despesa na lista
│   │       ├── AddExpenseSheet.tsx     # Bottom sheet para adicionar gasto
│   │       └── CategoryPicker.tsx      # Seletor horizontal de categorias
│   │
│   ├── services/               # Funções que chamam a API (sem estado)
│   │   ├── authService.ts
│   │   ├── coupleService.ts
│   │   └── expenseService.ts
│   │
│   ├── hooks/                  # Hooks com React Query
│   │   ├── useExpenses.ts      # useExpenses, useAddExpense, useDeleteExpense
│   │   └── useCouple.ts        # useCreateCouple, useJoinCouple
│   │
│   ├── store/                  # Estado global Zustand
│   │   ├── authStore.ts        # user, isAuthenticated, isLoading
│   │   └── coupleStore.ts      # couple, partner
│   │
│   ├── lib/                    # Clientes e instâncias singleton
│   │   ├── supabase.ts         # Cliente Supabase com AsyncStorage
│   │   ├── queryClient.ts      # QueryClient do React Query
│   │   └── apiClient.ts        # fetch wrapper com injeção de token
│   │
│   ├── types/
│   │   └── index.ts            # Todos os tipos TypeScript
│   │
│   ├── utils/
│   │   ├── format.ts           # formatCurrency, formatDate, getInitials
│   │   └── categoryMeta.ts     # Re-export de CATEGORY_META
│   │
│   ├── constants/
│   │   ├── categories.ts       # CATEGORY_META, EXPENSE_CATEGORIES
│   │   └── config.ts           # API_URL, SUPABASE_*, QUERY_KEYS
│   │
│   └── theme/                  # Design system
│       ├── colors.ts           # Paleta de cores
│       ├── typography.ts       # Famílias, tamanhos, line heights
│       ├── spacing.ts          # Escala de espaçamento e bordas
│       ├── shadows.ts          # Sombras cross-platform (iOS/Android)
│       └── index.ts            # Re-exports
│
├── backend/                    # API Express (não alterado)
│   └── src/
│       ├── routes/             # couples, expenses, categories
│       ├── controllers/
│       ├── middleware/
│       └── services/
│
├── assets/                     # Imagens, ícones, splash
├── global.css                  # Diretivas Tailwind para NativeWind
├── app.json                    # Configuração Expo
├── babel.config.js             # Babel: NativeWind + module-resolver + Reanimated
├── metro.config.js             # Metro: NativeWind
├── tailwind.config.js          # Tailwind com tema customizado
├── tsconfig.json               # TypeScript com path alias @/*
├── .eslintrc.js
├── .prettierrc
└── .env                        # Variáveis de ambiente
```

---

## Design System

### Cores principais

| Token | Hex | Uso |
|---|---|---|
| `primary-600` | `#7c3aed` | CTAs, active state, links |
| `primary-100` | `#ede9fe` | Backgrounds de destaque |
| `gray-50` | `#f8fafc` | Background de tela |
| `gray-900` | `#0f172a` | Texto principal |
| `gray-400` | `#94a3b8` | Texto secundário / placeholders |

### Tipografia

A fonte **Inter** (Google Fonts) é carregada via `@expo-google-fonts/inter`:
- `Inter_400Regular` — corpo
- `Inter_500Medium` — labels
- `Inter_600SemiBold` — subtítulos
- `Inter_700Bold` — títulos
- `Inter_900Black` — headings e valores monetários

### Componentes base (`src/components/ui`)

| Componente | Props principais | Uso |
|---|---|---|
| `Button` | `variant`, `size`, `loading`, `icon` | Ações primárias e secundárias |
| `Input` | `label`, `error`, `leftIcon` | Campos de formulário |
| `Card` | `padding` | Container com sombra |
| `Avatar` | `name`, `uri`, `size` | Foto / iniciais do usuário |
| `Badge` | `label`, `color`, `emoji` | Tags de categoria |
| `LoadingSpinner` | `fullScreen` | Estado de carregamento |

### Shadows

Sombras cross-platform definidas em `src/theme/shadows.ts`:
- `shadows.sm` — cards secundários
- `shadows.md` — cards principais (cor primária sutil)
- `shadows.lg` — FAB, modais

---

## Autenticação

### Fluxo

```
App abre
  └── _layout.tsx → getSessionUser()
        ├── Sem sessão → /(auth)/login
        ├── Com sessão, sem casal → /couple-setup
        └── Com sessão e casal → /(app)/
```

### Implementação

O Supabase Auth é configurado com `AsyncStorage` como storage para persistir a sessão nativamente:

```typescript
// src/lib/supabase.ts
createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
```

O `authStore` (Zustand) mantém `user`, `isAuthenticated` e `isLoading`. A inicialização acontece uma única vez no `_layout.tsx` raiz, que também ouve `onAuthStateChange` para lidar com logout e refresh de token.

---

## Navegação

### Estrutura (Expo Router)

```
app/
├── index.tsx           → redirect gate
├── (auth)/             → Stack sem tabs
│   ├── login
│   └── register
├── (app)/              → Tabs (3 abas)
│   ├── index           → Dashboard
│   ├── expenses        → Gastos
│   └── profile         → Perfil
└── couple-setup        → Modal (slide_from_bottom)
```

### Bottom Tabs

Configurado em `app/(app)/_layout.tsx` com `Tabs` do Expo Router. Ícones via `lucide-react-native`. TintColor primária quando ativa, cinza quando inativa.

### Deep Linking

O scheme `twinance://` está configurado em `app.json`. Para expandir, adicione rotas em `app/` e configure `linking` no `app.json`.

---

## Gerenciamento de estado

### Divisão de responsabilidades

| O que | Onde | Por quê |
|---|---|---|
| Usuário autenticado | Zustand (`authStore`) | Estado global persistente, sem servidor |
| Dados do casal | Zustand (`coupleStore`) | Muda raramente, precisa estar disponível em toda app |
| Lista de gastos | React Query (`useExpenses`) | Estado servidor com cache, invalidação automática |
| Estado de formulários | React Hook Form | Local por tela |

### authStore

```typescript
{ user, isAuthenticated, isLoading }
// setUser(user) → atualiza user + isAuthenticated
// reset() → usado no logout
```

### coupleStore

```typescript
{ couple, partner }
// setCoupleData(couple, partner) → atualiza ambos de uma vez
// reset() → usado no logout
```

### useExpenses (React Query)

```typescript
const { expenses, isLoading, error } = useExpenses()
const { mutateAsync, isPending } = useAddExpense()
const { mutate } = useDeleteExpense()
```

Após qualquer mutação, `invalidateQueries(['expenses'])` força recarregamento automático.

---

## Integração com Supabase

### Frontend → Supabase (auth direto)

Login, cadastro e logout são chamados diretamente via `supabase.auth`. O token JWT retornado é usado automaticamente pelo SDK.

### Frontend → Backend → Supabase (dados)

Todas as operações de dados (despesas, casal) passam pelo backend Express. O `apiClient.ts` injeta o token automaticamente:

```typescript
const session = await supabase.auth.getSession()
headers: { Authorization: `Bearer ${session.access_token}` }
```

### Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/me` | Perfil do usuário |
| `GET` | `/api/couples/mine` | Dados do casal |
| `POST` | `/api/couples` | Criar casal |
| `POST` | `/api/couples/join` | Entrar em um casal |
| `GET` | `/api/expenses` | Listar despesas |
| `POST` | `/api/expenses` | Criar despesa |
| `PUT` | `/api/expenses/:id` | Editar despesa |
| `DELETE` | `/api/expenses/:id` | Remover despesa |
| `GET` | `/api/categories` | Categorias |

---

## Como adicionar novas telas e features

### Nova tela

1. Crie o arquivo em `app/` seguindo a convenção do Expo Router
2. Se for autenticada, coloque em `app/(app)/`
3. Adicione a tab em `app/(app)/_layout.tsx` se necessário

### Nova feature (ex: metas financeiras)

```
src/features/goals/
  GoalCard.tsx          # Componente de exibição
  AddGoalSheet.tsx      # Bottom sheet de criação
src/hooks/useGoals.ts   # useGoals, useAddGoal, useDeleteGoal
src/services/goalService.ts  # getGoals, addGoal, deleteGoal
app/(app)/goals.tsx     # Tela
```

### Novo componente UI

1. Crie em `src/components/ui/NomeDoComponente.tsx`
2. Exporte em `src/components/ui/index.ts`
3. Use NativeWind `className` para estilização

---

## Configuração do ambiente

### Pré-requisitos

- Node.js 18+
- Expo CLI: `npm install -g expo-cli` (ou use `npx expo`)
- Conta Supabase com projeto criado
- Android Studio ou Xcode para emuladores

### Variáveis de ambiente

```env
# .env (frontend/mobile)
EXPO_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<chave-anon>
EXPO_PUBLIC_API_URL=http://<IP-da-máquina>:3001

# backend/.env
PORT=3001
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://<seu-projeto>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

> **Importante:** No Expo, `localhost` no `EXPO_PUBLIC_API_URL` NÃO funciona em dispositivos físicos. Use o IP da sua máquina na rede local (ex: `192.168.1.100`).

### Instalação e execução

```bash
# 1. Instalar dependências
npm install
npm install --prefix backend

# 2. Iniciar backend
npm run backend

# 3. Iniciar Expo (escolha um)
npx expo start          # QR Code para Expo Go
npx expo start --android
npx expo start --ios
```

---

## Build para produção

### Android (APK/AAB)

```bash
# APK para teste direto
npx eas build --platform android --profile preview

# AAB para Google Play
npx eas build --platform android --profile production
```

### iOS (IPA)

```bash
npx eas build --platform ios --profile production
```

### Configuração EAS

```bash
npm install -g eas-cli
eas login
eas build:configure
```

Configure `eas.json` com seus perfis de build.

---

## Publicação

### Expo Go (teste rápido)
```bash
npx expo publish
```

### Google Play Store
1. Gere o AAB via EAS Build
2. Configure o `app.json` com `android.package`
3. Envie via Google Play Console

### Apple App Store
1. Gere o IPA via EAS Build
2. Configure `app.json` com `ios.bundleIdentifier`
3. Envie via App Store Connect (Transporter ou EAS Submit)

```bash
eas submit --platform ios
eas submit --platform android
```

---

## Checklist da migração

### Migrado e funcionando

- [x] Configuração Expo (app.json, babel, metro, tsconfig)
- [x] NativeWind v4 com tema customizado (paleta violet)
- [x] Expo Router com grupos `(auth)` e `(app)`
- [x] Splash screen gerenciado com `expo-splash-screen`
- [x] Fontes Inter via `@expo-google-fonts/inter`
- [x] Supabase Auth com `AsyncStorage` (sessão persistente)
- [x] Zustand stores: `authStore`, `coupleStore`
- [x] React Query para gastos (cache, invalidação)
- [x] React Hook Form + Zod nos formulários
- [x] Tela de Login com validação
- [x] Tela de Cadastro com validação
- [x] Tela de Configuração de Casal (criar + entrar)
- [x] Dashboard com gráfico de barras e donut
- [x] Listagem de gastos com FlashList
- [x] Filtros de busca, categoria e pessoa
- [x] Bottom sheet de adicionar gasto (`@gorhom/bottom-sheet`)
- [x] Seletor de categoria horizontal (CategoryPicker)
- [x] Haptics em ações importantes
- [x] Tela de Perfil com código de convite + copiar
- [x] Logout com limpeza de estado
- [x] Backend mantido sem alterações

### Requer revisão manual

- [ ] Adicionar assets reais: `assets/icon.png`, `assets/splash.png`, `assets/adaptive-icon.png`
- [ ] Configurar `EXPO_PUBLIC_API_URL` com IP da máquina (não localhost) para dispositivos físicos
- [ ] Testar fluxo de autenticação end-to-end com Supabase real
- [ ] Verificar se trigger `handle_new_user` está ativo no Supabase (cria perfil automaticamente)
- [ ] Configurar EAS para builds de produção
- [ ] Adicionar DatePicker nativo para o campo de data no AddExpenseSheet
- [ ] Implementar modo dark (tema já preparado com Tailwind dark:)
- [ ] Adicionar testes unitários (hooks, services, utils)

### Limitações atuais

- O campo de data no formulário de despesas usa input de texto — em produção, substituir por `@react-native-community/datetimepicker`
- Os gráficos (gifted-charts) podem precisar de ajuste de largura em telas muito pequenas
- Sem offline support — requer conexão para todas as operações
- O backend precisa ser hospedado para uso em produção (não pode ser localhost)

---

## Melhorias futuras

| Feature | Complexidade | Prioridade |
|---|---|---|
| Metas financeiras compartilhadas | Média | Alta |
| Notificações push (Expo Notifications) | Média | Alta |
| Chat entre parceiros (Supabase Realtime) | Alta | Média |
| Calendário de gastos | Média | Média |
| Planejamento de viagens | Alta | Baixa |
| Export PDF/CSV | Baixa | Baixa |
| Modo dark | Baixa | Média |
| Biometria (expo-local-authentication) | Baixa | Média |
| Orçamento mensal por categoria | Média | Alta |
| Recorrência automática de gastos fixos | Alta | Média |

---

## Decisões técnicas

| Decisão | Alternativa considerada | Motivo da escolha |
|---|---|---|
| Expo Router | React Navigation manual | File-based routing mais limpo, deep linking automático |
| Zustand | Redux / Context API | Menos boilerplate, simples para o escopo atual |
| React Query | SWR / Apollo | API mais completa para mutations e invalidação |
| NativeWind v4 | StyleSheet puro | Mantém consistência com o Tailwind do web original |
| FlashList | FlatList | Performance superior em listas longas (sem recycles de DOM) |
| @gorhom/bottom-sheet | Modal nativo | UX mobile nativa com snap points e backdrop |
| AsyncStorage para Supabase | SecureStore | Compatibilidade nativa do SDK Supabase para RN |
| Backend Express mantido | Supabase Edge Functions | Zero mudança no backend, reutilização imediata |
