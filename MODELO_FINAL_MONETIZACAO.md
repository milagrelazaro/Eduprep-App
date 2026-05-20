# 💰 Modelo Final de Monetização - EduPrep

## ✅ MODELO IMPLEMENTADO

### 🎯 Estrutura Definida:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  🆓 GRATUITO (Preview)                         │
│  ├── Simulador: 5 questões aleatórias          │
│  ├── Exames: BLOQUEADO ❌                       │
│  └── Aulas: BLOQUEADO ❌                        │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  💎 PREMIUM (500 MT/mês)                       │
│  ├── Simulador: Completo (20+ questões)        │
│  ├── Exames: COMPLETO ✅                        │
│  └── Aulas: Ainda não incluídas                │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  💳 AULAS (Pay-per-use)                        │
│  ├── Preço: Definido pelo tutor (300-600 MT)   │
│  ├── Tutor recebe: 80% do valor                │
│  └── Plataforma: 20% de comissão               │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📚 Diferença: Simulador vs Exames

### **SIMULADOR** (Grátis para todos)
```
🎯 Objetivo: "Dar gana" / Preview
├── 5 questões aleatórias
├── Qualquer disciplina
├── Sem restrição
└── Para experimentar a plataforma
```

### **EXAMES** (Premium apenas)
```
🎓 Objetivo: Preparação completa
├── Exames completos (20+ questões)
├── Exames oficiais das universidades
├── Todas as questões do exame real
└── Apenas para Premium ✅
```

---

## 🔒 Bloqueios Implementados

### 1. **Simulador**
```typescript
// ✅ JÁ IMPLEMENTADO
const FREE_QUESTIONS_LIMIT = 5;
const hasPremiumAccess = canAccessFullExam(user);

if (!hasPremiumAccess && totalQuestions > 5) {
  // Mostra apenas 5 questões
  questions = questions.slice(0, 5);
  
  Alert.alert(
    '🎓 Modo Preview',
    'Você está fazendo um preview com 5 questões gratuitas.',
    [
      { text: 'Ver Planos', onPress: () => navigation.navigate('Pricing') },
      { text: 'Continuar Preview' }
    ]
  );
}
```

### 2. **Exames**
```typescript
// ✅ IMPLEMENTADO AGORA
const hasPremiumAccess = canAccessFullExam(user);

if (!hasPremiumAccess) {
  Alert.alert(
    '🔒 Exames Premium',
    'Os exames completos são exclusivos para usuários Premium.\n\n💡 Dica: Use o Simulador para testar com 5 questões grátis!',
    [
      { text: 'Ver Planos', onPress: () => navigation.navigate('Pricing') },
      { text: 'Ir para Simulador', onPress: () => navigation.navigate('EnhancedSimulator') },
      { text: 'Fechar', style: 'cancel' }
    ]
  );
  return; // Bloqueia acesso
}
```

### 3. **Aulas** (Próximo passo)
```typescript
// 🔜 A IMPLEMENTAR
const handleBookLesson = async (tutor) => {
  // Mostrar preço e opções de pagamento
  Alert.alert(
    'Marcar Aula',
    `Preço: ${tutor.pricePerHour} MT/hora\n\nDeseja continuar?`,
    [
      { 
        text: 'Pagar e Marcar', 
        onPress: () => navigation.navigate('PaymentConfirmation', {
          type: 'lesson',
          amount: tutor.pricePerHour,
          tutorId: tutor.id,
        })
      },
      { text: 'Cancelar' }
    ]
  );
};
```

---

## 🔄 Fluxo do Usuário

### **Usuário Gratuito:**
```
1. Entra no app
   ↓
2. Vai para Simulador
   ↓
3. Faz 5 questões (preview) - "Legal!"
   ↓
4. Tenta acessar Exames
   ↓
5. Vê bloqueio: "🔒 Premium"
   ↓
6. Clica "Ver Planos"
   ↓
7. Vê planos (500 MT/mês)
   ↓
8. Decide comprar ou não
```

### **Usuário Premium:**
```
1. Entra no app
   ↓
2. Acessa Simulador (completo)
   ↓
3. Acessa Exames (completo) ✅
   ↓
4. Faz todos os exames
   ↓
5. Vê tutores
   ↓
6. Marca aula (paga separado)
```

---

## 💳 Sistema de Pagamentos

### **Assinatura Premium:**
```
Planos:
├── Mensal: 500 MT/mês
├── Anual: 4.800 MT/ano (economiza 20%)
└── Vitalício: 15.000 MT (pagamento único)

Benefícios:
├── Simulados completos
├── Exames completos ⭐
└── Estatísticas avançadas
```

### **Aulas (Pay-per-use):**
```
Preço:
├── Definido pelo tutor (300-600 MT/hora)
├── Usuário paga por aula
└── Não precisa ser Premium

Comissão:
├── Tutor recebe: 80% (ex: 360 MT de 450 MT)
└── Plataforma: 20% (ex: 90 MT de 450 MT)

Pagamento:
├── Via M-Pesa, E-Mola ou Cartão
├── Processado antes da aula
└── Tutor recebe após aula completada
```

---

## 📊 Comparação Visual

| Funcionalidade | Gratuito | Premium | Aulas |
|----------------|----------|---------|-------|
| **Simulador** | 5 questões | Completo | - |
| **Exames** | ❌ Bloqueado | ✅ Completo | - |
| **Aulas** | ❌ Bloqueado | ❌ Não incluído | 💳 Pay-per-use |
| **Estatísticas** | Básicas | Avançadas | - |
| **Preço** | Grátis | 500 MT/mês | 300-600 MT/aula |

---

## ✅ Status de Implementação

### Implementado:
- [x] Simulador com 5 questões grátis
- [x] Simulador completo para Premium
- [x] Bloqueio de Exames para free users
- [x] Exames completos para Premium
- [x] Sistema de assinaturas (3 planos)
- [x] Telas de pagamento (Pricing, PaymentMethod, PaymentConfirmation)
- [x] Verificação premium (`canAccessFullExam`)

### Próximos Passos:
- [ ] Implementar pagamento individual de aulas
- [ ] Sistema de comissão 80/20 para tutores
- [ ] Tela de confirmação de aula com pagamento
- [ ] Histórico de aulas e pagamentos
- [ ] Avaliação de tutores após aula

---

## 🎯 Mensagens para o Usuário

### **Simulador (Free):**
```
🎓 Modo Preview

Este exame tem 20 questões.

✨ Você está fazendo um preview com 5 questões gratuitas.

🔓 Para acesso completo aos exames e aulas online, 
faça upgrade para Premium!

[Ver Planos] [Continuar Preview]
```

### **Exames (Bloqueado):**
```
🔒 Exames Premium

Os exames completos são exclusivos para usuários Premium.

💡 Dica: Use o Simulador para testar com 5 questões grátis!

🎓 Com Premium você tem:
• Todos os exames completos
• Simulados ilimitados
• Estatísticas avançadas

[Ver Planos] [Ir para Simulador] [Fechar]
```

### **Aulas (Pay-per-use):**
```
Marcar Aula

Tutor: João Silva
Disciplina: Matemática
Preço: 450 MT/hora

Deseja continuar?

[Pagar e Marcar] [Cancelar]
```

---

## 📈 Estratégia de Conversão

### Funil de Vendas:
```
1. Usuário experimenta (Simulador grátis)
   ↓ 100 usuários
2. Gosta e quer mais (tenta Exames)
   ↓ 60 usuários (60%)
3. Vê bloqueio e planos
   ↓ 40 usuários (40%)
4. Compra Premium
   ↓ 10 usuários (10% conversão)
5. Usa aulas (pay-per-use)
   ↓ 3 usuários (30% dos premium)
```

### Receita Estimada (100 usuários):
```
Premium:
├── 10 usuários × 500 MT = 5.000 MT/mês
└── Receita anual: 60.000 MT

Aulas:
├── 3 usuários × 2 aulas/mês × 450 MT = 2.700 MT
├── Comissão plataforma (20%): 540 MT/mês
└── Receita anual: 6.480 MT

Total: 66.480 MT/ano (de 100 usuários)
```

---

## 🚀 Próxima Implementação: Aulas Pay-per-use

### Arquivos a Modificar:
1. `src/screens/TutorProfileScreen.tsx` - Adicionar botão "Marcar Aula"
2. `src/screens/MarketplaceScreen.tsx` - Mostrar preços
3. `src/services/subscriptionService.ts` - Adicionar `lessonPaymentService`
4. `src/screens/PaymentConfirmationScreen.tsx` - Suportar type='lesson'

### Fluxo Técnico:
```typescript
1. Usuário clica "Marcar Aula"
2. Mostra preço do tutor
3. Usuário confirma
4. Navega para PaymentConfirmation (type: 'lesson')
5. Processa pagamento
6. Cria lesson no Firestore
7. Cria payment no Firestore
8. Tutor recebe notificação
9. Aula é marcada
```

---

**✅ MODELO CLARO E IMPLEMENTADO!**

- Simulador = Preview grátis (5 questões)
- Exames = Premium (completo)
- Aulas = Pay-per-use (separado)

**Pronto para testar e expandir! 🚀**
