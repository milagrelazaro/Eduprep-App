# Importação de Exames - SimulaPass

## 📋 Visão Geral

Este documento descreve como importar exames e questões em massa para o Firebase usando um arquivo CSV ou Excel.

## 📁 Arquivos

- **Modelo Excel:** `data/exames_modelo.xlsx` - Modelo Excel formatado e fácil de preencher (RECOMENDADO)
- **Modelo CSV:** `data/exames_modelo_organizado.csv` - Modelo CSV com instruções e exemplos
- **Script de Importação:** `scripts/importExamsFromCSV.ts` - Script para processar o CSV e importar para o Firebase
- **Gerador Excel:** `scripts/generateExcelTemplate.py` - Script para gerar novo modelo Excel

## 🚀 Processo de Importação

### Opção A: Usar Modelo Excel (RECOMENDADO)

1. Abra o arquivo `data/exames_modelo.xlsx` no Excel
2. O arquivo já vem com:
   - Instruções no topo
   - Cabeçalhos formatados
   - Descrições de cada campo
   - Exemplos preenchidos
   - 20 linhas em branco para preenchimento
3. Preencha com os dados dos exames
4. Salve como CSV (UTF-8) - "Salvar Como" → "CSV UTF-8 (delimitado por vírgulas)"
5. Execute o script de importação

### Opção B: Usar Modelo CSV

1. Abra o arquivo `data/exames_modelo_organizado.csv` no Excel ou editor de texto
2. Preencha os campos conforme necessário
3. Salve como CSV (UTF-8)

### Passo 2: Executar o Script

```bash
# Importar exames (pula exames que já existem)
npx ts-node scripts/importExamsFromCSV.ts data/exames_modelo.csv

# Forçar reimportação (inclui exames que já existem)
npx ts-node scripts/importExamsFromCSV.ts data/exames_modelo.csv --force
```

### Passo 3: Gerar Novo Modelo Excel (Opcional)

Se precisar de um novo modelo Excel com mais linhas:

```bash
python scripts/generateExcelTemplate.py
```

## 📊 Campos do CSV

### Campos do Exame (se repetem para cada questão)

| Campo | Descrição | Exemplo | Obrigatório |
|-------|-----------|---------|-------------|
| `institution` | Nome da instituição | UEM, UP, UCM, ISCTEM, Unilúrio, Universidade Zambeze | ✅ Sim |
| `subject` | Disciplina | Matemática, Física, Química, Biologia, Português, História, Geografia, Inglês | ✅ Sim |
| `year` | Ano do exame | 2023, 2024 | ✅ Sim |
| `duration` | Duração em minutos | 60, 90, 120 | ✅ Sim |
| `status` | Status do exame | approved, pending, rejected | ✅ Sim |
| `topic` | Tópico da questão | Álgebra, Mecânica, Gramática | ❌ Não |

### Campos da Questão

| Campo | Descrição | Exemplo | Obrigatório |
|-------|-----------|---------|-------------|
| `question_text` | Texto da pergunta | Qual é o valor de x na equação 2x + 5 = 15? | ✅ Sim |
| `option_a` | Opção A | 5 | ✅ Sim |
| `option_b` | Opção B | 10 | ✅ Sim |
| `option_c` | Opção C | 7.5 | ✅ Sim |
| `option_d` | Opção D | 3 | ✅ Sim |
| `correct_option` | Índice da resposta correta | 0=A, 1=B, 2=C, 3=D | ✅ Sim |
| `explanation` | Explicação da resposta | Para resolver: 2x + 5 = 15 → 2x = 10 → x = 5 | ❌ Não |
| `correct_feedback` | Feedback para resposta correta | Correto! Você isolou a variável corretamente. | ❌ Não |
| `incorrect_feedback` | Feedback para resposta incorreta | Incorreto. Lembre-se de isolar x subtraindo 5. | ❌ Não |
| `learn_more_url` | URL para mais informações | https://youtube.com/watch?v=xxx | ❌ Não |

## 📝 Exemplo de CSV

```csv
institution,subject,year,duration,status,topic,question_text,option_a,option_b,option_c,option_d,correct_option,explanation,correct_feedback,incorrect_feedback,learn_more_url
UEM,Matemática,2024,90,approved,Álgebra,Qual é o valor de x na equação 2x + 5 = 15?,5,10,7.5,3,0,Para resolver: 2x + 5 = 15 → 2x = 10 → x = 5,Correto! Você isolou a variável corretamente.,Incorreto. Lembre-se de isolar x subtraindo 5 de ambos os lados.,
UEM,Matemática,2024,90,approved,Álgebra,Qual é a raiz quadrada de 144?,10,12,14,16,1,12 × 12 = 144,Excelente! Você conhece as raízes quadradas.,Incorreto. 12 × 12 = 144.,
```

## ⚠️ Notas Importantes

1. **Codificação:** Salve o arquivo como CSV com codificação UTF-8
2. **Separação:** Use vírgula (`,`) como separador de campos
3. **Cabeçalho:** Não altere a linha de cabeçalho
4. **Linhas vazias:** Linhas começando com `#` são ignoradas (comentários)
5. **Campos vazios:** Campos opcionais podem ficar vazios
6. **Índice de resposta:** Use 0 para A, 1 para B, 2 para C, 3 para D

## 🔧 Estrutura no Firebase

Após a importação, os dados serão organizados assim:

```
exams (coleção)
├── {examId} (documento)
│   ├── institution: "UEM"
│   ├── subject: "Matemática"
│   ├── year: 2024
│   ├── duration: 90
│   ├── status: "approved"
│   ├── createdAt: timestamp
│   └── questions (subcoleção)
│       ├── {questionId1}
│       │   ├── text: "Qual é o valor de x...?"
│       │   ├── options: ["5", "10", "7.5", "3"]
│       │   ├── correctOption: 0
│       │   ├── explanation: "Para resolver..."
│       │   └── ...
│       └── {questionId2}
│           └── ...
```

## 🐛 Solução de Problemas

### Erro: "Arquivo não encontrado"
- Verifique se o caminho do arquivo está correto
- Use caminho relativo a partir da raiz do projeto

### Erro: "Cabeçalho não encontrado"
- Verifique se a primeira linha do CSV começa com `institution`
- Não remova a linha de cabeçalho

### Erro: "Permissão negada"
- Verifique se o Firebase está configurado corretamente
- Verifique as regras de segurança do Firestore

### Exames não aparecem no app
- Verifique se o `status` está como `approved`
- Apenas exames com status `approved` aparecem no simulador

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Console do script para mensagens de erro detalhadas
2. Logs do Firebase Console
3. Regras de segurança do Firestore
