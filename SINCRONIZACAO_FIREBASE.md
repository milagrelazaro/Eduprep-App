# 🔄 Sincronização Firebase + AsyncStorage - EduPrep

## 📊 Arquitetura de Dados

### Fluxo de Sincronização - Exames

```
┌─────────────────────────────────────────────────────────────┐
│                    USUÁRIO ABRE O APP                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │  examCatalogService.loadCatalog()  │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   Tem cache em memória?       │
         │   (cachedCatalog !== null)    │
         └───────┬───────────────┬───────┘
                 │ SIM           │ NÃO
                 ▼               ▼
         ┌───────────┐   ┌──────────────────────┐
         │  Retorna  │   │  Tenta Firebase      │
         │   cache   │   │  examService.get...  │
         └───────────┘   └──────┬───────────────┘
                                │
                    ┌───────────┴───────────┐
                    │ ONLINE                │ OFFLINE
                    ▼                       ▼
         ┌──────────────────┐    ┌─────────────────────┐
         │  Firebase retorna│    │  Firebase falha     │
         │  14 exames reais │    │  (sem internet)     │
         └────────┬─────────┘    └──────┬──────────────┘
                  │                     │
                  │                     ▼
                  │          ┌─────────────────────────┐
                  │          │  Carrega AsyncStorage   │
                  │          │  (cache local)          │
                  │          └──────┬──────────────────┘
                  │                 │
                  │                 │ Vazio?
                  │                 ▼
                  │          ┌─────────────────────────┐
                  │          │  Seed com dados locais  │
                  │          │  (14 exames mockData)   │
                  │          └──────┬──────────────────┘
                  │                 │
                  └─────────────────┴───────────────────┐
                                                        │
                                                        ▼
                                        ┌───────────────────────────┐
                                        │  Salva em AsyncStorage    │
                                        │  (cache para offline)     │
                                        └───────────┬───────────────┘
                                                    │
                                                    ▼
                                        ┌───────────────────────────┐
                                        │  Retorna exames para UI   │
                                        └───────────────────────────┘
```

---

## 📤 Upload de Exames

### Fluxo de Upload com Sincronização

```
┌─────────────────────────────────────────────────────────────┐
│         USUÁRIO FAZ UPLOAD DE EXAME (Premium)               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │  examCatalogService.addUploadedExam()  │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   Criar objeto ExamCatalogItem│
         │   (com ID temporário)         │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   Tentar salvar no Firebase   │
         │   examService.createExam()    │
         └───────┬───────────────┬───────┘
                 │ SUCESSO       │ FALHA
                 ▼               ▼
    ┌────────────────┐   ┌──────────────────┐
    │ Usar ID do     │   │ Manter ID local  │
    │ Firebase       │   │ (upload-123...)  │
    └────────┬───────┘   └──────┬───────────┘
             │                  │
             └──────────────────┴────────────┐
                                             │
                                             ▼
                              ┌──────────────────────────┐
                              │  Salvar em AsyncStorage  │
                              │  (cache local)           │
                              └──────────┬───────────────┘
                                         │
                                         ▼
                              ┌──────────────────────────┐
                              │  Exame aparece na UI     │
                              │  (status: pending)       │
                              └──────────────────────────┘
```

---

## 🔍 Comparação: Antes vs Depois

### ❌ ANTES (Apenas AsyncStorage)

```
Problemas:
- Exames apenas no dispositivo local
- Sem compartilhamento entre usuários
- Uploads não sincronizavam
- Dados perdidos ao desinstalar app
- Exames de teste duplicados no Firebase
```

### ✅ DEPOIS (Firebase + AsyncStorage)

```
Vantagens:
- ✅ Exames compartilhados entre todos os usuários
- ✅ Sincronização automática ao abrir app
- ✅ Modo offline funcional (cache local)
- ✅ Uploads salvos no Firebase para todos
- ✅ Dados persistem mesmo após desinstalar
- ✅ Scripts para limpar duplicados
```

---

## 📋 Coleções Firebase Utilizadas

### 1. `exams` - Catálogo de Exames
```typescript
{
  id: string;                    // Auto-gerado
  title: string;                 // "Matemática 2024 - UEM"
  subject: string;               // "Matemática"
  institution: string;           // "UEM"
  year: number;                  // 2024
  fileName: string;              // "matematica_uem_2024.pdf"
  pdfUrl?: string;               // URL do Storage
  size?: string;                 // "1.2 MB"
  description: string;
  duration: number;              // 90 minutos
  status: 'approved' | 'pending_validation' | 'rejected';
  uploadSource: 'pdf' | 'upload';
  aiProcessed: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2. `posts` - Feed de Notícias
```typescript
{
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: Timestamp;
}
```

### 3. `users` - Perfis de Usuários
```typescript
{
  id: string;
  email: string;
  name: string;
  role: 'student' | 'tutor' | 'admin';
  avatar?: string;
  subjects?: string[];
  institution?: string;
  createdAt: Timestamp;
}
```

---

## 🔧 Funções de Sincronização

### `examCatalogService.ts`

#### `loadCatalog()` - Carrega exames
1. Verifica cache em memória
2. Tenta Firebase (online)
3. Fallback AsyncStorage (offline)
4. Seed local se vazio

#### `addUploadedExam()` - Upload de exame
1. Cria objeto ExamCatalogItem
2. Salva no Firebase primeiro
3. Fallback local se Firebase falhar
4. Atualiza cache AsyncStorage

#### `syncWithFirebase()` - Sincronização manual
1. Força reload do Firebase
2. Atualiza cache local
3. Retorna exames atualizados

---

## 🚀 Como Usar

### 1. Setup Inicial (Uma vez)

```bash
# Limpar exames duplicados do Firestore
npx ts-node scripts/cleanDuplicateExams.ts

# Popular Firebase com 14 exames reais
npx ts-node scripts/seedFirebaseExams.ts
```

### 2. Verificar Sincronização

**No Firebase Console:**
- URL: https://console.firebase.google.com/project/fitness-app-realtime/firestore
- Coleção: `exams`
- Deve ter **14 documentos** com status `approved`

**No App:**
1. Abrir tela de Exames
2. Pull-to-refresh para forçar sincronização
3. Verificar se aparecem 14 exames

### 3. Testar Modo Offline

1. Abrir app com internet
2. Navegar para tela de Exames (carrega do Firebase)
3. Desligar internet/WiFi
4. Fechar e reabrir app
5. Exames ainda aparecem (cache AsyncStorage)

### 4. Testar Upload

1. Login como usuário premium
2. Fazer upload de exame
3. Verificar no Firebase Console se aparece
4. Outro usuário deve ver o exame (após refresh)

---

## 🐛 Troubleshooting

### Exames não aparecem no app

**Solução:**
```bash
# 1. Verificar Firebase Console
# 2. Rodar seed novamente
npx ts-node scripts/seedFirebaseExams.ts

# 3. No app: Settings → Limpar cache local
# 4. Fechar e reabrir app
```

### Exames duplicados

**Solução:**
```bash
npx ts-node scripts/cleanDuplicateExams.ts
```

### Firebase offline

**Comportamento esperado:**
- App usa cache AsyncStorage
- Exames aparecem normalmente
- Uploads ficam pendentes (salvos localmente)

### Cache desatualizado

**Solução no app:**
1. Tela de Exames → Pull-to-refresh
2. Ou: Settings → Limpar cache → Reabrir app

---

## 📊 Monitoramento

### Logs no Console

```typescript
// Firebase disponível
"Firebase exams loaded: 14"

// Firebase offline
"Firebase unavailable, using local cache"

// Upload bem-sucedido
"Exam uploaded to Firebase: abc123"

// Upload offline
"Firebase unavailable, saving locally only"
```

### Métricas Firebase

**Console → Firestore → Usage:**
- Leituras: ~50-100/dia por usuário ativo
- Escritas: ~5-10/dia (uploads)
- Armazenamento: ~50KB por exame

---

## ⚡ Performance

### Otimizações Implementadas

1. **Cache em memória** (`cachedCatalog`)
   - Evita leituras repetidas do AsyncStorage
   - Resetado ao reabrir app

2. **Fallback inteligente**
   - Firebase → AsyncStorage → Seed local
   - Garante que app sempre funciona

3. **Sincronização sob demanda**
   - Pull-to-refresh manual
   - Não sincroniza a cada navegação

4. **Batch operations**
   - Scripts usam batch para múltiplos exames
   - Reduz chamadas ao Firebase

---

## 🔐 Segurança

### Regras Firestore Recomendadas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Exames: leitura pública, escrita autenticada
    match /exams/{examId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (request.auth.token.role == 'admin' || 
         request.auth.token.role == 'tutor');
    }
    
    // Posts: leitura pública, escrita autenticada
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 📝 Próximos Passos

### Melhorias Futuras

1. **Sincronização em background**
   - Usar Firebase Realtime listeners
   - Atualizar UI automaticamente

2. **Conflict resolution**
   - Resolver conflitos offline/online
   - Merge inteligente de dados

3. **Compression**
   - Comprimir dados no AsyncStorage
   - Reduzir tamanho do cache

4. **Analytics**
   - Rastrear taxa de sincronização
   - Monitorar uso offline vs online
