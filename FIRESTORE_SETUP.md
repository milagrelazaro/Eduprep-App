# 🔥 Configuração do Firestore - EduPrep

## ✅ Coleções Criadas

Todas as coleções necessárias foram criadas com sucesso no Firestore!

### 📊 Lista Completa de Coleções:

| Coleção | Status | Descrição |
|---------|--------|-----------|
| **users** | ✅ Existia | Dados dos usuários (estudantes, tutores, admins) |
| **exams** | ✅ Existia | Exames e simulados |
| **examResults** | ✅ Existia | Resultados dos simulados |
| **tutors** | ✅ Criada | Configurações dos tutores (disciplinas, preços, disponibilidade) |
| **lessons** | ✅ Criada | Agendamentos de aulas |
| **notifications** | ✅ Criada | Notificações dos usuários |
| **posts** | ✅ Criada | Posts do feed social |
| **messages** | ✅ Criada | Mensagens entre usuários |
| **payments** | ✅ Criada | Pagamentos (para futuro) |

---

## 🗂️ Estrutura das Coleções

### 1. **users**
```typescript
{
  name: string,
  email: string,
  role: 'student' | 'tutor' | 'admin',
  avatar: string,
  status: 'active' | 'inactive',
  firebaseUid: string,
  intendedCourse?: string,
  competingDisciplines?: string[],
  focus?: 'exams' | 'tutoring' | 'both',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 2. **exams**
```typescript
{
  title: string,
  subject: string,
  institution: string,
  year: number,
  difficulty: 'easy' | 'medium' | 'hard',
  duration: number,
  status: 'pending' | 'approved' | 'rejected',
  createdBy: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Subcoleção:** `exams/{examId}/questions`
```typescript
{
  text: string,
  options: string[],
  correctOption: number,
  explanation: string,
  correctFeedback: string,
  incorrectFeedback: string,
  topic: string,
  learnMoreUrl?: string,
  createdAt: Timestamp
}
```

### 3. **examResults**
```typescript
{
  userId: string,
  examId: string,
  score: number,
  totalQuestions: number,
  correctAnswers: number,
  timeSpent: number,
  answers: Array<{
    questionId: string,
    selectedOption: number,
    isCorrect: boolean
  }>,
  completedAt: Timestamp
}
```

### 4. **tutors**
```typescript
{
  tutorId: string,
  subjects: string[],
  pricePerHour: number,
  bio: string,
  availability: {
    [day: string]: string[] // ex: { 'Segunda': ['08:00', '10:00'] }
  },
  status: 'active' | 'inactive',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 5. **lessons**
```typescript
{
  studentId: string,
  tutorId: string,
  subject: string,
  scheduledDate: Timestamp,
  duration: number, // em horas
  price: number,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 6. **notifications**
```typescript
{
  userId: string,
  title: string,
  message: string,
  type: 'lesson' | 'exam' | 'payment' | 'system',
  read: boolean,
  createdAt: Timestamp
}
```

### 7. **posts**
```typescript
{
  userId: string,
  userName: string,
  userAvatar: string,
  content: string,
  likes: number,
  comments: number,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 8. **messages**
```typescript
{
  senderId: string,
  receiverId: string,
  message: string,
  read: boolean,
  createdAt: Timestamp
}
```

### 9. **payments**
```typescript
{
  userId: string,
  lessonId: string,
  amount: number,
  method: 'M-Pesa' | 'E-Mola' | 'Cartão',
  status: 'pending' | 'completed' | 'failed',
  createdAt: Timestamp
}
```

---

## 🔐 Regras de Segurança

As regras do Firestore foram configuradas para:

### ✅ Permissões Públicas (sem autenticação):
- **users**: Criação permitida (para registro)
- **tutors**: Leitura permitida (para marketplace)

### ✅ Permissões com Autenticação:
- **exams**: Leitura e escrita
- **examResults**: Leitura e escrita
- **lessons**: Leitura e escrita
- **notifications**: Leitura (apenas próprias notificações)
- **posts**: Leitura e escrita
- **messages**: Leitura e escrita
- **payments**: Leitura e escrita

### 🔒 Permissões Especiais:
- **notifications**: Usuário só pode ler suas próprias notificações
- **users**: Usuário só pode atualizar/deletar seu próprio perfil

---

## 📝 Scripts Disponíveis

### 1. Inicializar Coleções
```bash
npx ts-node scripts/initializeFirestoreCollections.ts
```
Cria todas as coleções com documentos de exemplo.

### 2. Criar Admin
```bash
npx ts-node scripts/createAdminUser.ts
```
Cria usuário admin no Firebase Auth e Firestore.

### 3. Adicionar Questões aos Exames
```bash
npx ts-node scripts/addQuestionsToExams.ts
```
Popula exames com questões do mockData.

### 4. Limpar Questões
```bash
npx ts-node scripts/cleanExamQuestions.ts
```
Remove todas as questões dos exames.

---

## 🔗 Links Úteis

### Firebase Console
- **Projeto**: https://console.firebase.google.com/project/fitness-app-realtime
- **Firestore**: https://console.firebase.google.com/project/fitness-app-realtime/firestore
- **Authentication**: https://console.firebase.google.com/project/fitness-app-realtime/authentication
- **Regras**: https://console.firebase.google.com/project/fitness-app-realtime/firestore/rules

---

## ⚠️ Documentos de Exemplo

Os documentos criados pelo script de inicialização são apenas exemplos para criar as coleções.

**Você pode deletá-los manualmente no Firebase Console se desejar.**

Identificadores dos documentos de exemplo:
- `tutorId: 'sample-tutor-id'`
- `studentId: 'sample-student-id'`
- `userId: 'sample-user-id'`

---

## 🚀 Próximos Passos

1. ✅ Todas as coleções criadas
2. ✅ Regras de segurança configuradas
3. ✅ Scripts de inicialização prontos
4. ⏳ Testar funcionalidades no app
5. ⏳ Popular com dados reais

---

## 📊 Verificação

Para verificar se tudo está correto:

1. Acesse o Firebase Console
2. Vá para Firestore Database
3. Verifique se todas as 9 coleções estão listadas:
   - ✅ users
   - ✅ exams
   - ✅ examResults
   - ✅ tutors
   - ✅ lessons
   - ✅ notifications
   - ✅ posts
   - ✅ messages
   - ✅ payments

---

**Última atualização:** 10/04/2026 19:40
**Status:** ✅ Todas as coleções criadas e configuradas
