# 🔍 Verificação de Exames - PDFs vs Firebase

## ❓ Questão Principal

**"As questões no Firebase equivalem aos exames em PDF?"**

## 🎯 Como Verificar

### **Passo 1: Executar Script de Verificação**

```bash
# Verificar dados atuais no Firebase
cd C:\iProjects\eduprep-unificado
npx ts-node scripts/checkFirebaseData.ts
```

**O script vai mostrar:**
- ✅ Quantos exames estão cadastrados
- 📚 Quais instituições têm exames
- 📝 Quantas questões cada exame tem
- ⏳ Status de cada exame (aprovado/pendente)
- 🏛️ Quais universidades estão cadastradas

### **Passo 2: Comparar com os PDFs**

**Exames esperados (baseados em PDFs típicos de Moçambique):**

#### **UEM (Universidade Eduardo Mondlane)**
- Matemática (20 questões)
- Física (20 questões)
- Química (20 questões)
- Biologia (20 questões)
- Português (20 questões)

#### **UP (Universidade Pedagógica)**
- Matemática (20 questões)
- Português (20 questões)
- História (20 questões)
- Geografia (20 questões)

#### **ISRI**
- Português (20 questões)
- História (20 questões)
- Geografia (20 questões)
- Inglês (20 questões)

#### **Outras Instituições**
- UCM, UniLúrio, UniZambeze, ISCTEM
- Disciplinas variadas conforme curso

## 📊 Estrutura Esperada no Firebase

### **Collection: `exams`**
```typescript
{
  id: string,
  institution: string,        // "UEM", "UP", "ISRI", etc
  subject: string,            // "Matemática", "Física", etc
  year: number,               // 2024, 2023, etc
  duration: number,           // 120 (minutos)
  totalQuestions: number,     // 20
  status: string,             // "approved", "pending_validation", "rejected"
  createdBy: string,          // userId do admin
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### **Subcollection: `exams/{examId}/questions`**
```typescript
{
  id: string,
  question: string,           // Texto da questão
  options: string[],          // 4 opções (A, B, C, D)
  correctOption: number,      // 0, 1, 2 ou 3
  topic: string,              // "Álgebra", "Mecânica", etc
  difficulty: string,         // "easy", "medium", "hard"
  explanation: string,        // Explicação da resposta
  youtubeUrl?: string,        // Link para vídeo explicativo
  order: number               // Ordem da questão (1-20)
}
```

## 🚨 Cenários Possíveis

### **Cenário 1: Firebase Vazio**
```
❌ NENHUM EXAME ENCONTRADO
```
**Ação:** Cadastrar todos os exames dos PDFs

### **Cenário 2: Exames Parciais**
```
⚠️  5 exames encontrados (esperado: 20+)
```
**Ação:** Completar exames faltantes

### **Cenário 3: Exames Pendentes**
```
✅ 20 exames cadastrados
⏳ 0 exames aprovados
```
**Ação:** Aprovar exames via AdminExamsScreen

### **Cenário 4: Tudo OK**
```
✅ 20 exames cadastrados
✅ 20 exames aprovados
```
**Ação:** Nenhuma, sistema pronto!

## 📝 Como Cadastrar Exames dos PDFs

### **Opção 1: Manual via AdminExamsScreen**

1. Login como Admin
2. Ir para "Painel Admin"
3. Clicar em "Gestão de Exames"
4. Para cada PDF:
   - Clicar "Criar Novo Exame"
   - Preencher: Instituição, Disciplina, Ano, Duração
   - Adicionar 20 questões (uma por uma)
   - Salvar
5. Aprovar cada exame

**Tempo estimado:** 30-60 min por exame

### **Opção 2: Script de Importação (Recomendado)**

Criar arquivo JSON com os dados dos PDFs:

```json
{
  "exams": [
    {
      "institution": "UEM",
      "subject": "Matemática",
      "year": 2024,
      "duration": 120,
      "questions": [
        {
          "question": "Qual é o valor de x em 2x + 5 = 15?",
          "options": ["5", "10", "15", "20"],
          "correctOption": 0,
          "topic": "Álgebra",
          "explanation": "2x = 15 - 5 = 10, logo x = 5"
        },
        // ... mais 19 questões
      ]
    }
  ]
}
```

Depois executar script de importação.

### **Opção 3: Copiar de Outro Sistema**

Se os exames já estão em outro formato (Excel, Word, etc):
1. Converter para JSON
2. Importar via script

## 🎯 Checklist de Verificação

- [ ] Executar `checkFirebaseData.ts`
- [ ] Verificar quantos exames existem
- [ ] Comparar com lista de PDFs
- [ ] Verificar se questões estão completas (20 por exame)
- [ ] Verificar se exames estão aprovados
- [ ] Cadastrar universidades (`seedUniversities.ts`)
- [ ] Testar simulador com dados reais

## 🔧 Comandos Úteis

```bash
# Verificar dados
npx ts-node scripts/checkFirebaseData.ts

# Popular universidades
npx ts-node scripts/seedUniversities.ts

# Acessar Firebase Console
# https://console.firebase.google.com
# Ir para Firestore Database
# Verificar collections: exams, universities
```

## 📞 Próximos Passos

1. **Execute o script de verificação** para ver o estado atual
2. **Me informe o resultado** (quantos exames, quais instituições)
3. **Eu crio o script de importação** se necessário
4. **Cadastramos os exames** dos PDFs que você compartilhou

---

**Aguardando:** Execute `npx ts-node scripts/checkFirebaseData.ts` e me diga o resultado! 🚀
