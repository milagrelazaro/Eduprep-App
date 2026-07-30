# Sistema Automático de Upload de Exames

## 📋 Visão Geral

Sistema completo para upload automático de exames em PDF, usando IA (Claude) para extrair questões e importar diretamente para o Firebase com um único clique.

## 🏗️ Arquitetura

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   App Mobile    │         │   Backend API   │         │    Firebase     │
│  (AdminPanel)   │────────▶│   (Node.js)     │────────▶│   Firestore     │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                    │
                                    ▼
                            ┌─────────────────┐
                            │  Claude API     │
                            │  (Anthropic)    │
                            └─────────────────┘
```

## 📁 Estrutura de Arquivos

```
eduprep-unificado/
├── backend/
│   ├── server.js              # Servidor Express
│   ├── package.json           # Dependências do backend
│   └── .env                   # Variáveis de ambiente
├── src/
│   └── screens/
│       └── AdminPanelScreen.tsx  # Tela de upload no app
└── firebase-service-account.json  # Credenciais Firebase Admin
```

## 🚀 Como Usar

### 1. Configurar Firebase Admin

Crie o arquivo `firebase-service-account.json` na raiz do projeto:

1. Vá ao [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em Configurações do Projeto → Contas de Serviço
4. Clique em "Gerar nova chave privada"
5. Salve como `firebase-service-account.json` na raiz do projeto

**⚠️ IMPORTANTE:** Nunca commitar este arquivo no Git!

### 2. Iniciar o Backend

```bash
cd backend
npm install
npm start
```

O servidor iniciará em `http://localhost:3000`

### 3. Usar no App

1. Abra o app SimulaPass
2. Faça login como admin
3. Vá ao Painel Admin
4. Clique em "Novo Exame" na seção "Upload de Exames"
5. Selecione o PDF
6. Preencha: Instituição, Disciplina, Ano, Duração
7. Clique em "Processar Exame"
8. Aguarde o processamento automático
9. ✅ Pronto! As questões estão no Firebase

## 🔧 Configuração do Backend

### Variáveis de Ambiente (.env)

```env
PORT=3000
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### Dependências

- `express` - Servidor web
- `multer` - Upload de arquivos
- `cors` - CORS para requests
- `@anthropic-ai/sdk` - Claude API
- `firebase-admin` - Firebase Admin SDK
- `dotenv` - Variáveis de ambiente

## 📊 Fluxo de Dados

### 1. Upload do PDF

```
App → Seleciona PDF → Envia FormData para Backend
```

### 2. Processamento com Claude

```
Backend → Converte PDF para base64 → Envia para Claude API
Claude → Analisa PDF → Extrai questões → Retorna CSV
```

### 3. Importação para Firebase

```
Backend → Parse CSV → Cria documento exame → Adiciona questões como subcoleção
```

## 📋 Formato do CSV Gerado

O Claude gera CSV com as seguintes colunas:

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| `institution` | Instituição | UEM, UP, UCM |
| `subject` | Disciplina | Matemática, Física |
| `year` | Ano do exame | 2024 |
| `duration` | Duração em minutos | 90 |
| `status` | Status | approved |
| `topic` | Tópico da questão | Álgebra |
| `question_text` | Texto da pergunta | Qual é o valor de x? |
| `option_a` | Opção A | 5 |
| `option_b` | Opção B | 10 |
| `option_c` | Opção C | 7.5 |
| `option_d` | Opção D | 3 |
| `correct_option` | Índice correto (0-3) | 0 |
| `explanation` | Explicação | Para resolver... |
| `correct_feedback` | Feedback correto | Correto! |
| `incorrect_feedback` | Feedback incorreto | Incorreto... |
| `learn_more_url` | URL opcional | (vazio) |

## 🔌 API Endpoints

### POST /api/upload-exam

Upload e processamento de exame.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `file`: Arquivo PDF (max 10MB)
  - `institution`: Nome da instituição
  - `subject`: Nome da disciplina
  - `year`: Ano do exame
  - `duration`: Duração em minutos (opcional, padrão: 90)

**Response:**
```json
{
  "success": true,
  "questionsCount": 25,
  "csv": "institution,subject,year,...",
  "message": "Exame processado e importado com sucesso"
}
```

### GET /api/health

Health check do servidor.

**Response:**
```json
{
  "status": "ok",
  "firebase": true,
  "anthropic": true
}
```

## 🎨 Interface do App

### Modal de Upload

O modal possui 4 estados:

1. **Idle:** Formulário para selecionar PDF e preencher dados
2. **Uploading:** Mostra progresso de upload (0-30%)
3. **Processing:** Mostra processamento com IA (30-100%)
4. **Completed:** Sucesso com número de questões extraídas
5. **Error:** Erro com mensagem e opção de tentar novamente

### Campos do Formulário

- **Selecionar PDF:** Área de drag & drop (ou clique)
- **Instituição:** UEM, UP, UCM, ISCTEM, etc.
- **Disciplina:** Matemática, Física, Química, etc.
- **Ano:** 2024, 2023, etc.
- **Duração:** 90 minutos (padrão)

## 🐛 Troubleshooting

### Backend não inicia

**Erro:** `firebase-service-account.json não encontrado`

**Solução:** Crie o arquivo com as credenciais do Firebase Admin

### Erro ao processar PDF

**Erro:** `Erro ao processar exame`

**Soluções:**
- Verifique se o backend está rodando (`http://localhost:3000/api/health`)
- Verifique se a API key do Claude está correta
- Verifique se o PDF é válido e legível
- Verifique o console do backend para logs detalhados

### Claude API falha

**Erro:** `Erro na Claude API`

**Soluções:**
- Verifique se a API key é válida
- Verifique se há créditos disponíveis
- Tente com um PDF mais simples/legível

### Firebase não importa

**Erro:** `Firebase não disponível`

**Soluções:**
- Verifique se `firebase-service-account.json` existe
- Verifique se as credenciais são válidas
- Verifique as permissões do projeto Firebase

## 🔒 Segurança

### Variáveis de Ambiente

- Nunca commitar `.env`
- Nunca commitar `firebase-service-account.json`
- Usar variáveis de ambiente em produção
- Rotacionar API keys regularmente

### Validação

- Backend valida apenas PDFs
- Limite de 10MB por arquivo
- Campos obrigatórios validados
- Tratamento de erros robusto

## 📈 Monitoramento

### Logs do Backend

```bash
cd backend
npm start
```

Logs mostram:
- ✅ Firebase Admin inicializado
- 📄 Processando exame
- 🤖 Enviando para Claude API
- ✅ CSV gerado
- 📊 Número de questões extraídas
- 💾 Importando para Firebase
- ✅ Importação concluída

### Métricas

- Tempo de processamento por exame
- Número de questões extraídas
- Taxa de sucesso/falha
- Uso da Claude API

## 🚀 Próximos Passos

- [ ] Adicionar suporte para múltiplos PDFs
- [ ] Implementar fila de processamento
- [ ] Adicionar preview das questões antes de importar
- [ ] Implementar edição manual de questões extraídas
- [ ] Adicionar histórico de uploads
- [ ] Implementar retry automático em falhas
- [ ] Adicionar métricas e analytics
- [ ] Criar interface web alternativa

## 📝 Exemplo Completo

```bash
# 1. Iniciar backend
cd backend
npm start

# 2. No app (admin)
# - Abrir Painel Admin
# - Clicar "Novo Exame"
# - Selecionar "exame_uem_matematica_2024.pdf"
# - Preencher: UEM, Matemática, 2024, 90
# - Clicar "Processar Exame"
# - Aguardar processamento
# - ✅ 25 questões importadas!

# 3. Verificar no Firebase Console
# - Collection: exams
# - Document: [auto-generated]
# - Subcollection: questions (25 documentos)
```

## 🎯 Benefícios

- ✅ **Automático:** Um clique faz tudo
- ✅ **Inteligente:** Claude extrai questões com precisão
- ✅ **Rápido:** Processamento em segundos
- ✅ **Confiável:** Validação e tratamento de erros
- ✅ **Escalável:** Processa múltiplos exames
- ✅ **Seguro:** API keys protegidas
- ✅ **Flexível:** Suporta qualquer instituição/disciplina
