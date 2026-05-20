# 💰 Plano de Monetização - EduPrep

## 🎯 Estratégia Implementada

### 📚 Modelo Freemium

**Versão Gratuita (Preview):**
- ✅ 5 questões por simulado (preview)
- ✅ Acesso ao feed social
- ✅ Perfil básico
- ✅ Notificações
- ❌ Exames completos bloqueados
- ❌ Aulas online bloqueadas

**Versão Premium (Paga):**
- ✅ Acesso completo a todos os exames
- ✅ Aulas online ilimitadas
- ✅ Simulados completos (20+ questões)
- ✅ Estatísticas avançadas
- ✅ Certificados de conclusão
- ✅ Suporte prioritário

---

## 🔒 Sistema de Preview Implementado

### Simulador com Limitação

**Código Implementado:**
```typescript
// 🔒 PREVIEW MODE: Apenas 5 questões gratuitas
const FREE_QUESTIONS_LIMIT = 5;
const totalQuestions = questions.length;
const isPreviewMode = totalQuestions > FREE_QUESTIONS_LIMIT;

if (isPreviewMode) {
  // Selecionar 5 questões aleatórias para preview
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  questions = shuffled.slice(0, FREE_QUESTIONS_LIMIT);
  
  Alert.alert(
    '🎓 Modo Preview',
    `Este exame tem ${totalQuestions} questões.\n\n✨ Você está fazendo um preview com ${FREE_QUESTIONS_LIMIT} questões gratuitas.\n\n🔓 Para acesso completo aos exames e aulas online, será necessário um plano premium (em breve).`,
    [{ text: 'Continuar Preview', style: 'default' }]
  );
}
```

**Arquivo:** `src/screens/EnhancedSimulatorScreen.tsx`

---

## 📊 Estrutura de Dados para Premium

### 1. Adicionar Campo `isPremium` aos Usuários

**Firestore `users` collection:**
```typescript
{
  name: string,
  email: string,
  role: 'student' | 'tutor' | 'admin',
  isPremium: boolean, // ⭐ NOVO
  premiumExpiresAt?: Timestamp, // ⭐ NOVO
  subscriptionType?: 'monthly' | 'yearly' | 'lifetime', // ⭐ NOVO
  avatar: string,
  status: 'active' | 'inactive',
  firebaseUid: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 2. Coleção de Assinaturas

**Firestore `subscriptions` collection:**
```typescript
{
  userId: string,
  plan: 'monthly' | 'yearly' | 'lifetime',
  status: 'active' | 'expired' | 'cancelled',
  startDate: Timestamp,
  expiresAt: Timestamp,
  price: number,
  paymentMethod: 'M-Pesa' | 'E-Mola' | 'Cartão',
  transactionId: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 3. Histórico de Pagamentos

**Firestore `payments` collection (já existe):**
```typescript
{
  userId: string,
  type: 'subscription' | 'lesson', // ⭐ Adicionar tipo
  subscriptionId?: string, // ⭐ NOVO
  lessonId?: string,
  amount: number,
  method: 'M-Pesa' | 'E-Mola' | 'Cartão',
  status: 'pending' | 'completed' | 'failed',
  transactionId?: string,
  createdAt: Timestamp
}
```

---

## 💳 Planos de Preços Sugeridos

### Plano Mensal
```
💎 Premium Mensal
- Preço: 500 MT/mês
- Acesso completo a exames
- Aulas online ilimitadas
- Estatísticas avançadas
```

### Plano Anual (Desconto 20%)
```
💎 Premium Anual
- Preço: 4.800 MT/ano (400 MT/mês)
- Economia de 1.200 MT
- Todos os benefícios do mensal
- Certificado de conclusão
```

### Plano Vitalício
```
💎 Premium Vitalício
- Preço: 15.000 MT (pagamento único)
- Acesso permanente
- Todos os benefícios
- Suporte prioritário
```

---

## 🔓 Lógica de Verificação de Acesso

### Função Helper para Verificar Premium

**Criar arquivo:** `src/utils/premiumCheck.ts`
```typescript
import { User } from '../types';

export const isPremiumUser = (user: User | null): boolean => {
  if (!user) return false;
  
  // Admin sempre tem acesso premium
  if (user.role === 'admin') return true;
  
  // Verificar se é premium e não expirou
  if (user.isPremium) {
    if (!user.premiumExpiresAt) return true; // Vitalício
    
    const now = new Date();
    const expiresAt = user.premiumExpiresAt.toDate();
    return now < expiresAt;
  }
  
  return false;
};

export const canAccessFullExam = (user: User | null): boolean => {
  return isPremiumUser(user);
};

export const canBookLesson = (user: User | null): boolean => {
  return isPremiumUser(user);
};
```

### Uso no Simulador

```typescript
import { canAccessFullExam } from '../utils/premiumCheck';

const startExam = () => {
  // ... código existente ...
  
  const FREE_QUESTIONS_LIMIT = 5;
  const totalQuestions = questions.length;
  const hasPremiumAccess = canAccessFullExam(user);
  const isPreviewMode = !hasPremiumAccess && totalQuestions > FREE_QUESTIONS_LIMIT;
  
  if (isPreviewMode) {
    // Limitar a 5 questões
    questions = shuffled.slice(0, FREE_QUESTIONS_LIMIT);
    // Mostrar alerta de upgrade
  }
};
```

---

## 🎨 Telas de Upgrade Necessárias

### 1. Tela de Planos (`PricingScreen.tsx`)

```typescript
export default function PricingScreen() {
  return (
    <ScrollView>
      <Text variant="headlineMedium">Escolha seu Plano</Text>
      
      {/* Plano Gratuito */}
      <Card>
        <Text>Gratuito</Text>
        <Text>5 questões por exame</Text>
        <Text>Feed social</Text>
      </Card>
      
      {/* Plano Mensal */}
      <Card>
        <Text>Premium Mensal</Text>
        <Text>500 MT/mês</Text>
        <Button onPress={() => handleSubscribe('monthly')}>
          Assinar
        </Button>
      </Card>
      
      {/* Plano Anual */}
      <Card>
        <Text>Premium Anual</Text>
        <Text>4.800 MT/ano</Text>
        <Chip>Economize 20%</Chip>
        <Button onPress={() => handleSubscribe('yearly')}>
          Assinar
        </Button>
      </Card>
      
      {/* Plano Vitalício */}
      <Card>
        <Text>Premium Vitalício</Text>
        <Text>15.000 MT</Text>
        <Chip>Melhor valor</Chip>
        <Button onPress={() => handleSubscribe('lifetime')}>
          Comprar
        </Button>
      </Card>
    </ScrollView>
  );
}
```

### 2. Tela de Pagamento (`PaymentMethodScreen.tsx`)

```typescript
export default function PaymentMethodScreen({ route }) {
  const { plan, amount } = route.params;
  
  return (
    <View>
      <Text>Escolha o Método de Pagamento</Text>
      
      <TouchableOpacity onPress={() => handleMPesa()}>
        <Text>M-Pesa</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => handleEMola()}>
        <Text>E-Mola</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => handleCard()}>
        <Text>Cartão de Crédito</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### 3. Modal de Upgrade

```typescript
const UpgradeModal = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} onDismiss={onClose}>
      <Card>
        <Text variant="headlineSmall">🔒 Conteúdo Premium</Text>
        <Text>
          Para acesso completo aos exames e aulas online, 
          faça upgrade para Premium!
        </Text>
        
        <Button onPress={() => navigation.navigate('Pricing')}>
          Ver Planos
        </Button>
        
        <Button mode="outlined" onPress={onClose}>
          Continuar com Preview
        </Button>
      </Card>
    </Modal>
  );
};
```

---

## 🔄 Fluxo de Assinatura

```
1. Usuário tenta acessar exame completo
   ↓
2. Sistema verifica isPremium
   ↓
3. Se não premium → Mostra modal de upgrade
   ↓
4. Usuário clica "Ver Planos"
   ↓
5. Navega para PricingScreen
   ↓
6. Seleciona plano (mensal/anual/vitalício)
   ↓
7. Navega para PaymentMethodScreen
   ↓
8. Escolhe método (M-Pesa/E-Mola/Cartão)
   ↓
9. Processa pagamento
   ↓
10. Atualiza user.isPremium = true
   ↓
11. Salva em subscriptions collection
   ↓
12. Redireciona para exame completo
```

---

## 🛠️ Implementação Futura

### Fase 1: Estrutura Básica (Atual)
- ✅ Limitação de 5 questões
- ✅ Alert informando sobre premium
- ✅ TODO comments no código

### Fase 2: Sistema de Assinaturas
- [ ] Adicionar campo `isPremium` ao modelo User
- [ ] Criar coleção `subscriptions`
- [ ] Implementar `premiumCheck.ts`
- [ ] Criar `PricingScreen.tsx`

### Fase 3: Integração de Pagamentos
- [ ] Integrar M-Pesa API
- [ ] Integrar E-Mola API
- [ ] Implementar gateway de cartão
- [ ] Criar `PaymentMethodScreen.tsx`

### Fase 4: Gestão de Assinaturas
- [ ] Renovação automática
- [ ] Cancelamento de assinatura
- [ ] Histórico de pagamentos
- [ ] Notificações de expiração

### Fase 5: Features Premium
- [ ] Certificados de conclusão
- [ ] Estatísticas avançadas
- [ ] Suporte prioritário
- [ ] Conteúdo exclusivo

---

## 📝 Checklist de Implementação

### ✅ Já Implementado:
- [x] Limitação de 5 questões no simulador
- [x] Alert informando sobre preview mode
- [x] Mensagem sobre plano premium
- [x] Seleção aleatória de questões

### ⏳ Próximos Passos:
- [ ] Criar modelo de dados para assinaturas
- [ ] Implementar verificação de premium
- [ ] Criar tela de planos
- [ ] Integrar métodos de pagamento
- [ ] Implementar renovação automática

---

## 💡 Dicas de Monetização

### 1. **Trial Gratuito**
- Oferecer 7 dias de premium grátis
- Aumenta conversão de usuários

### 2. **Descontos Promocionais**
- Black Friday: 50% off
- Volta às aulas: 30% off
- Indicação de amigos: 20% off

### 3. **Gamificação**
- Ganhar 1 mês premium ao completar 10 simulados
- Recompensas por streak diário

### 4. **Planos para Escolas**
- Licença institucional
- Preço especial para grupos
- Dashboard para professores

---

## 🔗 Integrações de Pagamento Moçambique

### M-Pesa
- API: https://developer.mpesa.vm.co.mz
- Documentação oficial
- Taxa: ~3%

### E-Mola
- API: https://www.e-mola.com/developers
- Integração via API REST
- Taxa: ~2.5%

### Cartões (Visa/Mastercard)
- Gateway: PayGate, DPO PayGate
- Aceita cartões internacionais
- Taxa: ~3.5%

---

**Última atualização:** 10/04/2026 20:00
**Status:** ✅ Preview mode implementado, pronto para monetização
**Próximo passo:** Implementar sistema de assinaturas e pagamentos
