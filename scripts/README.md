# 🔧 Scripts de Gestão Firebase - EduPrep

## 📋 Scripts Disponíveis

### 1. **seedFirebaseExams.ts** - Seed Inicial de Exames
Popula o Firebase Firestore com os 14 exames reais do catálogo local.

**Quando usar:**
- Primeira configuração do Firebase
- Após limpar todos os exames e querer recomeçar
- Para garantir que todos os exames estão no Firebase

**Como executar:**
```bash
npx ts-node scripts/seedFirebaseExams.ts
```

**O que faz:**
- ✅ Verifica se o exame já existe (evita duplicados)
- ✅ Cria 14 exames reais (UEM, UP, UCM, Unilúrio, ISRI, ISCTEM)
- ✅ Define status `approved` para exames prontos
- ✅ Adiciona metadados: título, disciplina, instituição, ano, duração, PDF
- ✅ **Cadastra questões** de cada exame como subcoleção `questions`
- ✅ Cada exame tem entre 10-20 questões com opções múltiplas

**Exames incluídos:**
1. Matemática 2024 - UEM
2. Física 2024 - UEM
3. Química 2024 - UP
4. Biologia 2024 - UP
5. História 2023 - UCM
6. Geografia 2023 - UCM
7. Português 2024 - Unilúrio
8. Inglês 2024 - Unilúrio
9. Filosofia 2023 - ISRI
10. Sociologia 2023 - ISRI
11. Economia 2024 - ISCTEM
12. Contabilidade 2024 - ISCTEM
13. Informática 2024 - ISCTEM
14. Direito 2023 - UEM

---

### 2. **cleanDuplicateExams.ts** - Limpar Duplicados
Remove exames duplicados do Firebase (mesmo subject + institution + year).

**Quando usar:**
- Após detectar exames duplicados no Firestore
- Se houver exames de teste repetidos (ex: Matemática para todas instituições)
- Limpeza periódica de dados

**Como executar:**
```bash
npx ts-node scripts/cleanDuplicateExams.ts
```

**O que faz:**
- 🔍 Lista todos os exames do Firestore
- 🔍 Agrupa por `subject + institution + year`
- ⚠️  Identifica duplicados
- ✅ Mantém o exame mais recente
- ❌ Deleta os duplicados mais antigos
- 📊 Mostra resumo da limpeza

**Exemplo de output:**
```
🧹 Iniciando limpeza de exames duplicados...

📊 Total de exames encontrados: 42

⚠️  Duplicados encontrados para: Matemática-UEM-2024
   Total: 3 documentos
   ✅ Mantendo: abc123 (2024-04-09)
   ❌ Deletado: def456
   ❌ Deletado: ghi789

📊 Resumo:
   Duplicados encontrados: 28
   Duplicados deletados: 28
   Exames únicos restantes: 14

✅ Limpeza concluída!
```

---

## 🚀 Fluxo Recomendado

### Setup Inicial
```bash
# 1. Limpar duplicados/testes existentes
npx ts-node scripts/cleanDuplicateExams.ts

# 2. Fazer seed dos 14 exames reais
npx ts-node scripts/seedFirebaseExams.ts
```

### Verificar no Firebase Console
1. Acesse: https://console.firebase.google.com/project/fitness-app-realtime/firestore
2. Navegue para coleção `exams`
3. Confirme que há **14 documentos** com status `approved`
4. Verifique campos: `title`, `subject`, `institution`, `year`, `status`, `duration`

---

## 🔍 Troubleshooting

### Erro: "Firebase not initialized"
Verifique se as credenciais no script estão corretas:
```typescript
const firebaseConfig = {
  apiKey: 'AIzaSyDkrZwgzFDb8x_aCaD-XCVFXDokrJiQGDE',
  projectId: 'fitness-app-realtime',
  // ...
};
```

### Erro: "Permission denied"
Configure regras do Firestore para permitir escrita:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /exams/{examId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Exames não aparecem no app
1. Execute `npx ts-node scripts/seedFirebaseExams.ts`
2. No app, force refresh (pull-to-refresh na tela de exames)
3. Ou limpe cache: Settings → Limpar dados locais

---

## 📊 Estrutura de Dados

### Coleção `exams`

```typescript
{
  id: string;                    // Auto-gerado pelo Firestore
  title: string;                 // "Matemática 2024 - UEM"
  subject: string;               // "Matemática"
  institution: string;           // "UEM"
  year: number;                  // 2024
  fileName: string;              // "matematica_uem_2024.pdf"
  pdfUrl?: string;               // URL do PDF no Storage
  size?: string;                 // "1.2 MB"
  description: string;           // "Exame oficial UEM 2024"
  duration: number;              // 90 (minutos)
  status: 'approved' | 'pending_validation' | 'rejected';
  uploadSource: 'pdf' | 'upload';
  aiProcessed: boolean;          // true se processado pela IA
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Subcoleção `exams/{examId}/questions`

```typescript
{
  id: string;                    // Auto-gerado
  text: string;                  // "Qual é a derivada de x²?"
  options: string[];             // ["2x", "x", "2", "x²"]
  correctOption: number;         // 0 (índice da resposta correta)
  explanation?: string;          // "A derivada de x² é 2x pela regra do poder"
  correctFeedback?: string;      // "Resposta correta!"
  incorrectFeedback?: string;    // "Resposta incorreta. Revise derivadas."
  topic?: string;                // "Cálculo Diferencial"
  createdAt: Timestamp;
}
```

---

## ⚠️ Avisos Importantes

1. **Backup antes de limpar**: Os scripts deletam dados permanentemente
2. **Executar em produção**: Tenha cuidado ao rodar em ambiente de produção
3. **Rate limits**: Firebase tem limites de escrita (20.000/dia no plano free)
4. **Custo**: Operações de leitura/escrita contam para quota gratuita

---

## 📝 Logs e Debugging

Ambos os scripts mostram logs detalhados:
- ✅ Operações bem-sucedidas
- ⚠️  Avisos (duplicados, já existe)
- ❌ Erros (permissão, rede)
- 📊 Resumo final

Para debug adicional, descomente logs no código:
```typescript
console.log('Debug:', examData);
```
