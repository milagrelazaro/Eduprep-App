# 🔍 Telas com Dados Mocados - AUDITORIA COMPLETA

## ❌ TELAS COM DADOS MOCADOS ENCONTRADAS

### 1. ❌ **PerformanceScreen.tsx**
**Dados Mocados:**
```typescript
const MOCK_PERFORMANCE = {
  overallScore: 14.5,
  targetScore: 16,
  examsTaken: 12,
  strongSubjects: ['Matemática', 'Física'],
  weakSubjects: ['Português', 'Biologia'],
  recommendations: [...], // 4 recomendações hardcoded
  subjectProgress: [...], // 5 disciplinas hardcoded
};
```

**O que deveria ser:**
- Calcular `overallScore` da média de `examResults` do usuário
- Calcular `examsTaken` da contagem de `examResults`
- Identificar `strongSubjects` e `weakSubjects` baseado em scores reais
- Gerar `recommendations` baseado em performance real
- Calcular `subjectProgress` de resultados reais por disciplina

---

### 2. ❌ **RankingScreen.tsx**
**Dados Mocados:**
```typescript
const MOCK_RANKING = [
  { id: '1', name: 'Ana Machava', score: 19, subject: 'Matemática', avatar: '' },
  { id: '2', name: 'Carlos Tembe', score: 18, subject: 'Matemática', avatar: '' },
  { id: '3', name: 'Fátima Nhaca', score: 18, subject: 'Física', avatar: '' },
  // ... mais 7 usuários fake
];
```

**O que deveria ser:**
- Buscar todos os `examResults` do Firestore
- Agrupar por usuário
- Calcular melhor score de cada usuário
- Ordenar por score
- Mostrar ranking real

---

### 3. ❌ **NotificationsScreen.tsx**
**Dados Mocados:**
```typescript
const MOCK_NOTIFICATIONS = [
  { id: '1', type: 'lesson', title: 'Aula Confirmada', ... },
  { id: '2', type: 'payment', title: 'Pagamento Recebido', ... },
  { id: '3', type: 'exam', title: 'Novo Simulado Disponível', ... },
  // ... mais 3 notificações fake
];
```

**O que deveria ser:**
- Buscar notificações reais do Firestore
- Collection `notifications` com:
  - Aulas confirmadas/canceladas
  - Pagamentos recebidos
  - Novos exames disponíveis
  - Mensagens de tutores
  - Avisos do admin

---

### 4. ❌ **ImprovedSimulatorScreen.tsx**
**Dados Mocados:**
```typescript
const MOCK_QUESTIONS = [
  {
    id: 1,
    question: 'Qual é o valor de x na equação 2x + 5 = 13?',
    options: ['x = 2', 'x = 4', 'x = 6', 'x = 8'],
    correctAnswer: 1,
    explanation: '2x = 13 - 5 = 8, logo x = 4',
  },
  // ... mais 9 questões hardcoded
];
```

**O que deveria ser:**
- Buscar questões reais do Firestore
- Usar `EnhancedSimulatorScreen` que já busca do Firestore
- **NOTA:** Já existe `EnhancedSimulatorScreen.tsx` com dados reais!
- Esta tela `ImprovedSimulatorScreen.tsx` pode ser deletada

---

## ✅ TELAS JÁ COM DADOS REAIS

### ✅ **AdminExamsScreen.tsx**
- Busca exames do Firestore
- Estatísticas reais
- Sem dados mocados

### ✅ **AdminFinanceScreen.tsx**
- Busca pagamentos e assinaturas do Firestore
- Cálculos reais de receitas
- Sem dados mocados

### ✅ **MarketplaceScreen.tsx**
- Busca tutores do Firestore
- Sem geração aleatória
- Valores padrão fixos

### ✅ **FeedScreen.tsx**
- Busca posts do Firestore
- Sem dados mocados

### ✅ **MessagesScreen.tsx** + **NewChatModal.tsx**
- Busca usuários reais do Firestore
- Sem dados mocados

### ✅ **EnhancedSimulatorScreen.tsx**
- Busca exames e questões do Firestore
- Salva resultados no Firestore
- Sem dados mocados

### ✅ **TutorProfileScreen.tsx**
- Usa dados reais do tutor
- Fallback para valores padrão
- Sem dados mocados

### ✅ **TutorSettingsScreen.tsx**
- Salva configurações no Firestore
- Sem dados mocados

---

## 📋 PLANO DE CORREÇÃO

### 1. **PerformanceScreen** - Calcular de Dados Reais
```typescript
// Buscar resultados do usuário
const examResults = await examResultService.getUserResults(user.id);

// Calcular estatísticas
const overallScore = calculateAverage(examResults);
const examsTaken = examResults.length;
const subjectScores = groupBySubject(examResults);
const strongSubjects = getTopSubjects(subjectScores, 2);
const weakSubjects = getBottomSubjects(subjectScores, 2);

// Gerar recomendações baseadas em dados reais
const recommendations = generateRecommendations(subjectScores, targetScore);
```

### 2. **RankingScreen** - Buscar Ranking Real
```typescript
// Buscar todos os resultados
const allResults = await examResultService.getAllResults();

// Agrupar por usuário e calcular melhor score
const userScores = allResults.reduce((acc, result) => {
  if (!acc[result.userId] || result.score > acc[result.userId].score) {
    acc[result.userId] = {
      userId: result.userId,
      name: result.userName,
      score: result.score,
      subject: result.subject,
      avatar: result.userAvatar,
    };
  }
  return acc;
}, {});

// Ordenar por score
const ranking = Object.values(userScores).sort((a, b) => b.score - a.score);
```

### 3. **NotificationsScreen** - Buscar do Firestore
```typescript
// Buscar notificações do usuário
const notifications = await notificationService.getUserNotifications(user.id);

// Ordenar por data
const sorted = notifications.sort((a, b) => 
  b.createdAt.getTime() - a.createdAt.getTime()
);
```

**Collection `notifications`:**
```typescript
{
  id: "notif_123",
  userId: "user_456",
  type: "lesson" | "payment" | "exam" | "message" | "announcement",
  title: "Aula Confirmada",
  body: "Pedro Sambo aceitou a sua aula...",
  read: false,
  createdAt: Timestamp,
  data: {
    lessonId: "lesson_789", // Opcional
    paymentId: "payment_012", // Opcional
    examId: "exam_345", // Opcional
  }
}
```

### 4. **ImprovedSimulatorScreen** - DELETAR
- Já existe `EnhancedSimulatorScreen.tsx` com dados reais
- `ImprovedSimulatorScreen.tsx` é redundante
- Deve ser deletado

---

## 🎯 PRIORIDADE DE CORREÇÃO

### Alta Prioridade:
1. ✅ **ImprovedSimulatorScreen** - Deletar (redundante)
2. ❌ **NotificationsScreen** - Implementar com Firestore
3. ❌ **RankingScreen** - Buscar ranking real

### Média Prioridade:
4. ❌ **PerformanceScreen** - Calcular de dados reais

---

## 📊 RESUMO

| Tela | Status | Ação Necessária |
|------|--------|-----------------|
| AdminExamsScreen | ✅ Real | Nenhuma |
| AdminFinanceScreen | ✅ Real | Nenhuma |
| MarketplaceScreen | ✅ Real | Nenhuma |
| FeedScreen | ✅ Real | Nenhuma |
| MessagesScreen | ✅ Real | Nenhuma |
| NewChatModal | ✅ Real | Nenhuma |
| EnhancedSimulatorScreen | ✅ Real | Nenhuma |
| TutorProfileScreen | ✅ Real | Nenhuma |
| TutorSettingsScreen | ✅ Real | Nenhuma |
| **PerformanceScreen** | ❌ Mocado | Calcular de examResults |
| **RankingScreen** | ❌ Mocado | Buscar do Firestore |
| **NotificationsScreen** | ❌ Mocado | Buscar do Firestore |
| **ImprovedSimulatorScreen** | ❌ Mocado | **DELETAR** (redundante) |

---

## ✅ TELAS CORRETAS: 9/13 (69%)
## ❌ TELAS MOCADAS: 4/13 (31%)

---

**Próximos passos:**
1. Deletar `ImprovedSimulatorScreen.tsx`
2. Implementar `NotificationsScreen` com Firestore
3. Implementar `RankingScreen` com dados reais
4. Implementar `PerformanceScreen` com cálculos reais

---

**Última atualização:** 11/04/2026 20:25  
**Status:** Auditoria completa realizada
