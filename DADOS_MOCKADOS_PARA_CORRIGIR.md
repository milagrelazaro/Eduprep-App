# 🔍 Dados Mockados que Precisam ser Substituídos por Firebase

## ❌ Dados Mockados Encontrados:

### 1. **NotificationsScreen.tsx** (Linha 16-49)
```typescript
const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Novo Simulado Disponível', ... },
  { id: '2', title: 'Parabéns! 🎉', ... },
  { id: '3', title: 'Lembrete de Estudo', ... },
  { id: '4', title: 'Desconto Especial', ... },
];
```
**Solução:** Criar coleção `notifications` no Firestore

### 2. **FavoriteUniversitiesScreen.tsx** (Linha 7-15)
```typescript
const UNIVERSITIES = [
  { id: '1', name: 'UEM', fullName: 'Universidade Eduardo Mondlane', ... },
  { id: '2', name: 'UP', fullName: 'Universidade Pedagógica', ... },
  // ... mais 5 universidades
];
```
**Solução:** Criar coleção `universities` no Firestore

### 3. **EnhancedSimulatorScreen.tsx** (Linha 14-22)
```typescript
const INSTITUTIONS = ['UEM', 'UP', 'UCM', 'ISCTEM', 'Unilúrio', 'Universidade Zambeze'];
const SUBJECTS = ['Matemática', 'Física', 'Química', 'Biologia', 'Português', 'História', 'Geografia', 'Inglês'];
const TOPICS = {
  'Matemática': ['Álgebra', 'Geometria', 'Trigonometria', 'Cálculo', 'Estatística'],
  'Física': ['Mecânica', 'Termodinâmica', 'Eletromagnetismo', 'Óptica', 'Ondas'],
  // ...
};
```
**Solução:** Buscar de `universities` e dos próprios `exams` no Firestore

## ✅ Dados Já Vindos do Firebase:

1. ✅ **Exames** - `EnhancedSimulatorScreen` busca de `exams` collection
2. ✅ **Resultados** - `DashboardScreen` busca de `examResults` collection
3. ✅ **Ranking** - `RankingScreen` busca de `examResults` e calcula
4. ✅ **Usuários** - `AdminPanelScreen` busca de `users` collection
5. ✅ **Promotores** - `PromoterPanelScreen` busca de `promoters` e `referrals`

## 📋 Estrutura Firebase Necessária:

### Coleção: `notifications`
```typescript
{
  id: string,
  userId: string, // ou 'all' para todos
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'promo',
  read: boolean,
  createdAt: timestamp,
  expiresAt: timestamp | null
}
```

### Coleção: `universities`
```typescript
{
  id: string,
  name: string, // Sigla (UEM, UP, etc)
  fullName: string,
  location: string,
  icon: string, // emoji
  active: boolean,
  createdAt: timestamp
}
```

### Coleção: `subjects` (opcional - pode vir dos exams)
```typescript
{
  id: string,
  name: string,
  topics: string[],
  icon: string,
  active: boolean
}
```

## 🎯 Prioridade de Correção:

1. **Alta:** Universidades (usadas em vários lugares)
2. **Média:** Notificações (funcionalidade secundária)
3. **Baixa:** Subjects/Topics (já vêm dos exames)
