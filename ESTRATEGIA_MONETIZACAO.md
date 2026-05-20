# 💰 Estratégia de Monetização - EduPrep

## 🤔 Análise do Modelo de Negócio

### Situação Atual:
- ✅ Simulador: 5 questões grátis (preview)
- ❓ Exames completos: Não definido
- ❓ Aulas (Explicações): Pagamento por aula ou assinatura?

---

## 🎯 Proposta de Modelo Híbrido

### Opção A: **Assinatura Única (Recomendado)**
```
Premium = Acesso Total
├── Simulados completos (20+ questões)
├── Exames completos
├── Aulas online ilimitadas
└── Estatísticas avançadas
```

**Vantagens:**
- ✅ Simples para o usuário entender
- ✅ Receita previsível
- ✅ Incentiva uso contínuo
- ✅ Menos fricção

**Desvantagens:**
- ❌ Tutores não ganham por aula individual
- ❌ Menor flexibilidade

---

### Opção B: **Modelo Misto (Mais Complexo)**
```
Gratuito:
├── 5 questões por simulado
├── Preview de exames (primeiras 5 questões)
└── Ver perfis de tutores

Premium (500 MT/mês):
├── Simulados completos
├── Exames completos
└── Estatísticas avançadas

Aulas (Pay-per-use):
├── Pagar por aula individual
├── Preço definido pelo tutor
└── Tutor recebe 80% (plataforma 20%)
```

**Vantagens:**
- ✅ Tutores ganham por aula
- ✅ Usuários pagam só o que usam
- ✅ Mais opções de monetização

**Desvantagens:**
- ❌ Mais complexo
- ❌ Mais fricção no pagamento
- ❌ Usuário pode hesitar em marcar aulas

---

### Opção C: **Modelo Freemium Completo (Recomendado para MVP)**
```
Gratuito:
├── 5 questões por simulado
├── Preview de exames (5 questões)
├── Ver perfis de tutores
└── 1 aula grátis por mês

Premium Básico (500 MT/mês):
├── Simulados completos
├── Exames completos
├── 5 aulas por mês
└── Estatísticas básicas

Premium Plus (1.200 MT/mês):
├── Tudo do Básico
├── Aulas ilimitadas
├── Estatísticas avançadas
├── Certificados
└── Suporte prioritário

Premium Vitalício (15.000 MT):
├── Tudo do Plus
└── Para sempre
```

**Vantagens:**
- ✅ Múltiplos pontos de entrada
- ✅ Escalável
- ✅ Tutores recebem da plataforma
- ✅ Usuário escolhe o plano ideal

---

## 🎓 Fluxo Proposto para Aulas

### Cenário 1: Aulas Incluídas na Assinatura
```
1. Usuário Premium marca aula
   ↓
2. Tutor aceita
   ↓
3. Aula acontece
   ↓
4. Tutor recebe pagamento fixo da plataforma
   (ex: 200 MT por aula de 1h)
   ↓
5. Plataforma lucra com assinaturas
```

**Pagamento do Tutor:**
- Fixo por hora (ex: 200 MT/h)
- Pago pela plataforma
- Mensal ou por aula completada

---

### Cenário 2: Aulas Pay-per-use (Separado)
```
1. Usuário (free ou premium) marca aula
   ↓
2. Sistema mostra preço do tutor (ex: 450 MT/h)
   ↓
3. Usuário paga
   ↓
4. Tutor aceita
   ↓
5. Aula acontece
   ↓
6. Tutor recebe 80% (360 MT)
   ↓
7. Plataforma fica com 20% (90 MT)
```

**Pagamento do Tutor:**
- Define próprio preço
- Recebe 80% do valor
- Pago após aula completada

---

## 📊 Comparação de Modelos

| Aspecto | Assinatura Única | Modelo Misto | Freemium Completo |
|---------|------------------|--------------|-------------------|
| **Simplicidade** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Receita Previsível** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Flexibilidade** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Ganho do Tutor** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Conversão** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🎯 Recomendação Final

### **Modelo Freemium Completo (Opção C)**

#### Planos:
```
🆓 Gratuito
├── 5 questões por simulado
├── 5 questões por exame
├── Ver perfis de tutores
└── Sem aulas

💎 Premium (500 MT/mês)
├── Simulados completos
├── Exames completos
├── Estatísticas avançadas
└── Sem aulas (ou 1 aula grátis)

💎 Premium + Aulas (1.200 MT/mês)
├── Tudo do Premium
├── 5 aulas por mês
└── Aulas extras: 200 MT/aula

💎 Premium Ilimitado (2.000 MT/mês)
├── Tudo do Premium
├── Aulas ilimitadas
├── Certificados
└── Suporte VIP
```

#### Pagamento de Tutores:
- **Fixo por aula:** 150 MT/hora (pago pela plataforma)
- **Bônus por avaliação:** +50 MT se nota ≥ 4.5
- **Pagamento:** Semanal ou mensal

---

## 🔄 Fluxo Implementado vs Proposto

### Atualmente Implementado:
```
Simulador:
├── Free: 5 questões ✅
└── Premium: Completo ✅

Exames:
├── Free: ? (não definido)
└── Premium: ? (não definido)

Aulas:
├── Free: ? (não definido)
└── Premium: ? (não definido)
```

### Proposta de Implementação:
```
Simulador:
├── Free: 5 questões ✅ (já implementado)
└── Premium: Completo ✅ (já implementado)

Exames:
├── Free: 5 questões (preview)
└── Premium: Completo

Aulas:
├── Free: Não pode marcar
├── Premium Básico: Não pode marcar (ou 1 grátis)
├── Premium + Aulas: 5 aulas/mês
└── Premium Ilimitado: Ilimitado
```

---

## 💡 Decisões Necessárias

### 1. **Aulas são incluídas na assinatura ou separadas?**

**Opção A: Incluídas**
- Premium (500 MT) = Exames + Simulados (sem aulas)
- Premium Plus (1.200 MT) = Exames + Simulados + 5 aulas/mês
- Premium Ilimitado (2.000 MT) = Tudo ilimitado

**Opção B: Separadas**
- Premium (500 MT) = Exames + Simulados
- Aulas = Pay-per-use (200-500 MT/aula)
- Tutor define preço e recebe 80%

### 2. **Como tutores são pagos?**

**Opção A: Fixo pela plataforma**
- 150 MT/hora
- Pago pela plataforma
- Simples e previsível

**Opção B: Percentual do valor da aula**
- Tutor define preço (300-600 MT/hora)
- Recebe 80% do valor
- Mais motivador para tutores

### 3. **Exames têm preview?**

**Opção A: Sim (Recomendado)**
- Free: 5 questões de cada exame
- Premium: Exame completo
- Consistente com simulador

**Opção B: Não**
- Free: Não acessa exames
- Premium: Acesso completo
- Mais restritivo

---

## 🚀 Plano de Ação Sugerido

### Fase 1: MVP Simples (Recomendado para agora)
```
Gratuito:
├── Simulador: 5 questões ✅
├── Exames: 5 questões (implementar)
└── Aulas: Não pode marcar (implementar bloqueio)

Premium (500 MT/mês):
├── Simulador: Completo ✅
├── Exames: Completo (implementar)
└── Aulas: Não incluídas

Aulas (Pay-per-use):
├── Qualquer usuário pode comprar
├── Preço fixo: 300 MT/hora
├── Tutor recebe 80% (240 MT)
└── Plataforma fica com 20% (60 MT)
```

### Fase 2: Expansão (Futuro)
```
Adicionar planos:
├── Premium Plus (1.200 MT) = Premium + 5 aulas
└── Premium Ilimitado (2.000 MT) = Tudo ilimitado
```

---

## 📝 Implementação Técnica Necessária

### 1. **Exames com Preview**
```typescript
// src/screens/ExamScreen.tsx
const canAccessFullExam = isPremiumUser(user);
const questions = canAccessFullExam 
  ? exam.questions 
  : exam.questions.slice(0, 5);

if (!canAccessFullExam && exam.questions.length > 5) {
  Alert.alert(
    '🔒 Exame Completo',
    'Faça upgrade para Premium e acesse todos os exames completos!',
    [
      { text: 'Ver Planos', onPress: () => navigation.navigate('Pricing') },
      { text: 'Continuar Preview' }
    ]
  );
}
```

### 2. **Aulas Pay-per-use**
```typescript
// src/screens/TutorProfileScreen.tsx
const handleBookLesson = async () => {
  // Mostrar preço
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

### 3. **Bloqueio de Aulas para Free**
```typescript
// src/screens/MarketplaceScreen.tsx
const handleSelectTutor = (tutor) => {
  if (!canBookLesson(user)) {
    Alert.alert(
      '🔒 Aulas Premium',
      'As aulas são pagas individualmente.\n\nPreço: 300 MT/hora',
      [
        { text: 'Ver Tutores', style: 'cancel' },
        { text: 'Continuar', onPress: () => navigation.navigate('TutorProfile', { tutor }) }
      ]
    );
  } else {
    navigation.navigate('TutorProfile', { tutor });
  }
};
```

---

## ❓ Perguntas para Decisão

1. **Aulas incluídas na assinatura ou pay-per-use?**
   - [ ] Incluídas (mais simples)
   - [ ] Pay-per-use (mais flexível)
   - [ ] Híbrido (planos com/sem aulas)

2. **Como tutores são pagos?**
   - [ ] Fixo pela plataforma (150 MT/hora)
   - [ ] Percentual do valor (80% do preço da aula)

3. **Exames têm preview?**
   - [ ] Sim, 5 questões grátis
   - [ ] Não, bloqueado para free

4. **Quantos planos oferecer no MVP?**
   - [ ] 1 plano (Premium simples)
   - [ ] 2 planos (Premium + Premium Plus)
   - [ ] 3 planos (Básico + Plus + Ilimitado)

---

**Aguardando suas decisões para implementar! 🚀**
