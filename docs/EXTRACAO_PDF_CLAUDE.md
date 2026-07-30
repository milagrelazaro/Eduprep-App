# Extração de Exames de PDF usando Claude API

## 📋 Visão Geral

Este script usa a API do Claude (Anthropic) para ler PDFs de exames e extrair automaticamente as questões no formato CSV compatível com o SimulaPass.

## 📁 Arquivos

- **Script:** `scripts/extractExamFromPDF.py` - Script Python para extração
- **Saída:** `data/exames_extraidos.csv` - CSV gerado com as questões extraídas
- **Referência:** `data/exames_modelo.xlsx` - Modelo de formato usado como base

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
pip install anthropic
```

### 2. Executar o Script

```bash
python scripts/extractExamFromPDF.py <pdf_path> <institution> <subject> <year> [duration]
```

**Parâmetros:**
- `pdf_path`: Caminho do arquivo PDF do exame
- `institution`: Nome da instituição (UEM, UP, UCM, ISCTEM, Unilúrio, Universidade Zambeze)
- `subject`: Nome da disciplina (Matemática, Física, Química, Biologia, etc.)
- `year`: Ano do exame (2024, 2023, etc.)
- `duration`: Duração em minutos (opcional, padrão: 90)

**Exemplos:**

```bash
# Exame de Matemática UEM 2024
python scripts/extractExamFromPDF.py exames/uem_matematica_2024.pdf UEM Matemática 2024 90

# Exame de Física UP 2023
python scripts/extractExamFromPDF.py exames/up_fisica_2023.pdf UP Física 2023 120

# Exame de Química UCM 2024 (duração padrão 90)
python scripts/extractExamFromPDF.py exames/ucm_quimica_2024.pdf UCM Química 2024
```

### 3. Importar para Firebase

Após gerar o CSV, importe para o Firebase:

```bash
npx ts-node scripts/importExamsFromCSV.ts data/exames_extraidos.csv
```

## 📊 Formato do CSV Gerado

O script gera CSV com as seguintes colunas (igual ao exames_modelo.xlsx):

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| `institution` | Instituição | UEM, UP, UCM, ISCTEM |
| `subject` | Disciplina | Matemática, Física, Química |
| `year` | Ano do exame | 2024, 2023 |
| `duration` | Duração em minutos | 90, 120 |
| `status` | Status do exame | approved |
| `topic` | Tópico da questão | Álgebra, Geometria, Mecânica |
| `question_text` | Texto da pergunta | Qual é o valor de x? |
| `option_a` | Opção A | 5 |
| `option_b` | Opção B | 10 |
| `option_c` | Opção C | 7.5 |
| `option_d` | Opção D | 3 |
| `correct_option` | Índice correto (0=A, 1=B, 2=C, 3=D) | 0 |
| `explanation` | Explicação | Para resolver: 2x + 5 = 15 |
| `correct_feedback` | Feedback correto | Correto! Você isolou a variável |
| `incorrect_feedback` | Feedback incorreto | Incorreto. Lembre-se de isolar x |
| `learn_more_url` | URL opcional | (vazio se não houver) |

## 🤖 Como Funciona

1. **Codificação do PDF:** O PDF é codificado em base64
2. **Envio para Claude:** O PDF é enviado para a API do Claude 3.5 Sonnet
3. **Extração Inteligente:** Claude analisa o PDF e extrai:
   - Todas as questões de múltipla escolha
   - Opções de resposta
   - Resposta correta
   - Explicações e feedbacks
4. **Geração de CSV:** Os dados são formatados em CSV válido

## ⚠️ Notas Importantes

- **API Key:** A API key está configurada no script (pode ser movida para variável de ambiente)
- **Custo:** Cada chamada à API consome tokens do Claude
- **Qualidade do PDF:** PDFs bem formatados e legíveis produzem melhores resultados
- **Validação:** Sempre revise o CSV gerado antes de importar para o Firebase
- **Limite:** O modelo Claude 3.5 Sonnet suporta até 200K tokens de contexto

## 🔧 Personalização

### Alterar o Prompt

Edite a variável `prompt` no script para ajustar as instruções de extração:

```python
prompt = f"""
Analise este PDF de exame e extraia todas as questões de múltipla escolha.

INSTITUIÇÃO: {institution}
DISCIPLINA: {subject}
ANO: {year}
DURAÇÃO: {duration} minutos
STATUS: approved

[Suas instruções personalizadas aqui]
"""
```

### Alterar o Modelo

Mude o modelo do Claude editando:

```python
message = client.messages.create(
    model="claude-3-5-sonnet-20241022",  # ou "claude-3-opus-20240229"
    max_tokens=8192,
    ...
)
```

## 🐛 Troubleshooting

**Erro: "PDF não encontrado"**
- Verifique se o caminho do PDF está correto
- Use caminhos relativos ou absolutos

**Erro: "Falha ao extrair questões"**
- Verifique se a API key está correta
- Verifique sua conexão com a internet
- Tente com um PDF mais simples/legível

**CSV com formato incorreto**
- Revise manualmente o CSV gerado
- Verifique se o Claude extraiu corretamente as questões
- Ajuste o prompt se necessário

## 📝 Exemplo Completo

```bash
# 1. Colocar PDF na pasta exames/
mkdir exames
copy exame_uem_matematica.pdf exames/

# 2. Executar extração
python scripts/extractExamFromPDF.py exames/exame_uem_matematica.pdf UEM Matemática 2024 90

# 3. Revisar CSV gerado
notepad data/exames_extraidos.csv

# 4. Importar para Firebase
npx ts-node scripts/importExamsFromCSV.ts data/exames_extraidos.csv
```

## 🎯 Próximos Passos

- [ ] Adicionar suporte para múltiplos PDFs de uma vez
- [ ] Implementar validação automática do CSV gerado
- [ ] Adicionar modo de visualização prévia antes de salvar
- [ ] Criar interface web para upload de PDFs
