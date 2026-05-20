# 📝 Fluxo de Criação de Exames - EduPrep

## 🎯 Visão Geral

Existem **2 formas** de criar exames no EduPrep:

### 1️⃣ Criação Manual (Formulário)
**Tela:** `CreateExamScreen`  
**Acesso:** Menu → Criar Exame (Admin/Tutor)  
**Fluxo:**
```
Usuário preenche formulário
  ↓
Adiciona questões manualmente (uma por uma)
  ↓
Clica em "Criar Exame"
  ↓
examService.createExam()
  ↓
Firebase: cria documento em exams/
  ↓
Firebase: cria subcoleção questions/ com todas as questões
  ↓
Status: 'approved' (admin) ou 'pending' (tutor)
```

### 2️⃣ Upload de PDF (IA)
**Tela:** `UploadExamScreen`  
**Acesso:** Tab "Upload" (Premium)  
**Fluxo:**
```
Usuário seleciona PDF
  ↓
Preenche metadados (título, disciplina, instituição)
  ↓
Clica em "Processar com IA"
  ↓
[PLACEHOLDER] Gemini AI extrai questões do PDF
  ↓
examCatalogService.addUploadedExam()
  ↓
examService.createExam() (via catalogService)
  ↓
Firebase: cria documento em exams/
  ↓
Firebase: cria subcoleção questions/ (se IA processou)
  ↓
Status: 'pending_validation' (aguarda aprovação admin)
```

---

## 🗂️ Estrutura no Firestore

### Coleção `exams`
```typescript
exams/{examId}
{
  id: string;
  title: string;                 // "Matemática 2024 - UEM"
  subject: string;               // "Matemática"
  institution: string;           // "UEM"
  year: number;                  // 2024
  duration: number;              // 120 (minutos)
  difficulty?: 'easy' | 'medium' | 'hard';
  topics: string[];              // ["Álgebra", "Geometria"]
  status: 'approved' | 'pending' | 'pending_validation' | 'rejected';
  uploadSource: 'pdf' | 'upload' | 'manual';
  aiProcessed: boolean;
  uploadedBy?: string;           // userId
  fileName?: string;
  pdfUrl?: string;
  size?: string;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Subcoleção `exams/{examId}/questions`
```typescript
exams/{examId}/questions/{questionId}
{
  id: string;
  text: string;                  // "Qual é a derivada de x²?"
  options: string[];             // ["2x", "x", "2", "x²"]
  correctOption: number;         // 0 (índice da resposta correta)
  explanation?: string;
  correctFeedback?: string;
  incorrectFeedback?: string;
  topic?: string;
  learnMoreUrl?: string;
  createdAt: Timestamp;
}
```

---

## 🔄 Sincronização com AsyncStorage

### Carregamento de Exames
```typescript
// examCatalogService.ts - loadCatalog()
1. Tenta carregar do Firebase (exams aprovados)
2. Se sucesso → salva em AsyncStorage (cache)
3. Se falha → carrega de AsyncStorage (offline)
4. Se vazio → seed local (MOCK_EXAMS)
```

### Carregamento de Questões
```typescript
// examCatalogService.ts - getExamDataForSimulation()
1. Tenta carregar de Firebase (subcoleção questions)
2. Se sucesso → retorna questões do Firebase
3. Se falha → fallback para MOCK_EXAMS local
```

---

## 🎨 Interfaces de Usuário

### CreateExamScreen (Manual)
```
┌─────────────────────────────────┐
│  📋 Criar Exame                 │
├─────────────────────────────────┤
│  Instituição: [UEM] [UP] [UCM]  │
│  Disciplina: [Mat] [Fís] [Quí]  │
│  Ano: [2024]  Duração: [120min] │
│  Dificuldade: [●Medium]         │
├─────────────────────────────────┤
│  ➕ Adicionar Questão            │
│  Pergunta: [____________]       │
│  Opção A: [____________]        │
│  Opção B: [____________]        │
│  Opção C: [____________]        │
│  Opção D: [____________]        │
│  Resposta Correta: [A]          │
│  Explicação: [____________]     │
│  [Adicionar Questão]            │
├─────────────────────────────────┤
│  📝 Questões Adicionadas: 5     │
│  1. Qual é a derivada...? [🗑️]  │
│  2. Calcule a integral...? [🗑️] │
├─────────────────────────────────┤
│  [Criar Exame] [Cancelar]       │
└─────────────────────────────────┘
```

### UploadExamScreen (IA)
```
┌─────────────────────────────────┐
│  📤 Upload de Exame             │
├─────────────────────────────────┤
│  📄 Selecionar PDF              │
│  [Escolher Arquivo]             │
│  ✅ matematica_2024.pdf (1.2MB) │
├─────────────────────────────────┤
│  Título: [Matemática 2024 UEM]  │
│  Disciplina: [Matemática ▼]     │
│  Instituição: [UEM ▼]           │
│  Ano: [2024]                    │
├─────────────────────────────────┤
│  🤖 Processar com IA            │
│  [Processar Exame]              │
└─────────────────────────────────┘
```

---

## 🔐 Permissões

### Quem pode criar exames?

| Tipo | CreateExam (Manual) | UploadExam (IA) |
|------|---------------------|-----------------|
| **Estudante** | ❌ Não | ❌ Não (ou Premium) |
| **Tutor** | ✅ Sim (pending) | ✅ Sim (pending_validation) |
| **Admin** | ✅ Sim (approved) | ✅ Sim (approved) |

### Status de Aprovação

- **approved**: Exame visível para todos
- **pending**: Criado por tutor, aguarda aprovação
- **pending_validation**: Upload por IA, aguarda validação
- **rejected**: Rejeitado pelo admin

---

## 📊 Fluxo Completo (Diagrama)

```
┌──────────────┐
│   Usuário    │
└──────┬───────┘
       │
       ├─────────────────┬─────────────────┐
       │                 │                 │
   [Manual]          [Upload]         [Admin]
       │                 │                 │
       ▼                 ▼                 ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│CreateExam   │   │UploadExam   │   │ Aprovar/    │
│Screen       │   │Screen       │   │ Rejeitar    │
└──────┬──────┘   └──────┬──────┘   └──────┬──────┘
       │                 │                 │
       │                 │                 │
       ▼                 ▼                 ▼
┌──────────────────────────────────────────────┐
│        examService.createExam()              │
│  1. Cria documento em exams/                 │
│  2. Cria subcoleção questions/               │
│  3. Define status (approved/pending)         │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│           Firebase Firestore                 │
│  exams/{examId}                              │
│    └── questions/{questionId}                │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│      examCatalogService.loadCatalog()        │
│  1. Carrega de Firebase                      │
│  2. Salva em AsyncStorage (cache)            │
│  3. Disponível no app                        │
└──────────────────────────────────────────────┘
```

---

## ✅ Checklist de Implementação

- [x] `CreateExamScreen` criado
- [x] `UploadExamScreen` criado
- [x] `examService.createExam()` salva exame + questões no Firestore
- [x] `examCatalogService` carrega de Firebase com fallback AsyncStorage
- [x] Subcoleção `questions` criada automaticamente
- [x] Status de aprovação implementado
- [x] Permissões por role (admin/tutor)
- [ ] **TODO**: Tela de aprovação de exames para admin
- [ ] **TODO**: Integração real com Gemini AI para processar PDFs

---

## 🚀 Como Usar

### Para Criar Exame Manualmente:
1. Login como **Admin** ou **Tutor**
2. Menu → **Criar Exame**
3. Preencher formulário
4. Adicionar questões (mínimo 1)
5. Clicar em **Criar Exame**
6. ✅ Exame criado no Firestore!

### Para Upload de PDF:
1. Login como **Premium User**
2. Tab **Upload**
3. Selecionar PDF
4. Preencher metadados
5. Clicar em **Processar com IA**
6. ⏳ Aguardar aprovação do admin

---

## 🔧 Arquivos Principais

| Arquivo | Função |
|---------|--------|
| `src/screens/CreateExamScreen.tsx` | UI para criação manual |
| `src/screens/UploadExamScreen.tsx` | UI para upload de PDF |
| `src/services/firebaseService.ts` | `examService.createExam()` |
| `src/services/examCatalogService.ts` | Gerenciamento de catálogo |
| `scripts/seedFirebaseExams.ts` | Seed inicial de exames |
| `scripts/addQuestionsToExams.ts` | Adicionar questões a exames existentes |
| `scripts/cleanExamQuestions.ts` | Limpar questões antigas |

---

**Última atualização:** 2026-04-09
