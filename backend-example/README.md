# 🚀 EduPrep Backend API - Guia Completo

Backend Node.js/Express para processar exames com Google Gemini IA e integrar pagamentos MPesa/eMola.

---

## 📦 Instalação

### 1. Instalar Node.js
Se ainda não tem Node.js instalado:
- Download: https://nodejs.org/ (versão LTS)
- Verificar instalação: `node --version`

### 2. Instalar dependências
```bash
cd backend-example
npm install
```

---

## ⚙️ Configuração

A API Key do Google Gemini já está configurada no arquivo `.env`:
```
GEMINI_API_KEY=AIzaSyDhr3WU8yOXMzkoedbzeHiiGA7gWq_-rPY
```

**Limite gratuito:** 1.500 requisições/dia

---

## 🎯 Como Usar

### Iniciar o servidor
```bash
npm start
```

Ou com auto-reload (desenvolvimento):
```bash
npm run dev
```

O servidor estará disponível em: **http://localhost:3000**

---

## 📡 Endpoints Disponíveis

### 1. Health Check
```bash
GET http://localhost:3000/health
```

**Resposta:**
```json
{
  "status": "OK",
  "timestamp": "2026-03-01T20:40:00.000Z",
  "geminiConfigured": true
}
```

---

### 2. Processar Exame com IA
```bash
POST http://localhost:3000/api/exams/process
Content-Type: application/json

{
  "examTitle": "Exame de Admissão UEM 2024",
  "subject": "Matemática",
  "institution": "UEM",
  "fileBase64": "JVBERi0xLjQKJeLjz9MKMy...",
  "mimeType": "application/pdf"
}
```

**Resposta de sucesso:**
```json
{
  "success": true,
  "exam": {
    "examTitle": "Exame de Admissão UEM 2024",
    "subject": "Matemática",
    "institution": "UEM",
    "totalQuestions": 15,
    "questions": [
      {
        "id": 1,
        "question": "Qual é o valor de x na equação 2x + 5 = 13?",
        "options": ["A) x = 2", "B) x = 4", "C) x = 6", "D) x = 8"],
        "correctAnswer": 1,
        "explanation": "Para resolver: 2x + 5 = 13 → 2x = 8 → x = 4",
        "correctComment": "Excelente! Você domina equações de primeiro grau.",
        "wrongComment": "Revise os passos: isole o x primeiro, depois divida.",
        "youtubeCorrect": "https://youtube.com/watch?v=exemplo1",
        "youtubeWrong": "https://youtube.com/watch?v=exemplo2"
      }
    ]
  },
  "message": "Exame processado com sucesso! 15 questões extraídas."
}
```

---

### 3. Iniciar Pagamento
```bash
POST http://localhost:3000/api/payments/initiate
Content-Type: application/json

{
  "amount": 500,
  "email": "estudante@eduprep.com",
  "phone": "258843334444",
  "description": "Pagamento aula de Matemática"
}
```

**Resposta:**
```json
{
  "success": true,
  "paymentToken": "DPO-1709326800000",
  "paymentUrl": "https://secure.3gdirectpay.com/payv2.php?ID=DPO-1709326800000",
  "amount": 500,
  "currency": "MZN",
  "message": "Pagamento iniciado com sucesso"
}
```

---

### 4. Callback de Pagamento (Webhook)
```bash
POST http://localhost:3000/api/payments/callback
Content-Type: application/json

{
  "transactionToken": "DPO-1709326800000",
  "companyRef": "EDUPREP-123456",
  "transactionStatus": "Approved"
}
```

---

## 🔗 Integrar com o App React Native

### Modificar `UploadExamScreen.tsx`

Substituir a função `processWithAI`:

```typescript
const processWithAI = async () => {
  if (!selectedFile || !examTitle || !selectedSubject || !selectedInstitution) {
    Alert.alert('Atenção', 'Preencha todos os campos e selecione um ficheiro.');
    return;
  }

  setIsProcessing(true);

  try {
    // Converter ficheiro para base64 (se for real)
    // const fileBase64 = await FileSystem.readAsStringAsync(selectedFile.uri, {
    //   encoding: FileSystem.EncodingType.Base64,
    // });

    // Mock para demonstração
    const fileBase64 = 'mock_base64_content';

    const response = await fetch('http://localhost:3000/api/exams/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        examTitle,
        subject: selectedSubject,
        institution: selectedInstitution,
        fileBase64,
        mimeType: 'application/pdf',
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Salvar exame processado
      const uploadedExam = {
        id: Date.now().toString(),
        title: examTitle,
        subject: selectedSubject,
        institution: selectedInstitution,
        uploadDate: new Date().toLocaleDateString(),
        status: 'pending_validation',
        aiProcessed: true,
        questionsGenerated: data.exam.totalQuestions,
        questions: data.exam.questions,
      };

      const saved = await AsyncStorage.getItem('eduprep_uploaded_exams');
      const exams = saved ? JSON.parse(saved) : [];
      await AsyncStorage.setItem('eduprep_uploaded_exams', JSON.stringify([uploadedExam, ...exams]));

      setUploadSuccess(true);
    } else {
      Alert.alert('Erro', data.error || 'Erro ao processar exame');
    }
  } catch (error) {
    Alert.alert('Erro', 'Não foi possível conectar ao servidor');
  } finally {
    setIsProcessing(false);
  }
};
```

---

## 🧪 Testar com Postman/Insomnia

### Exemplo de teste rápido:

1. Abrir Postman
2. Criar requisição POST: `http://localhost:3000/api/exams/process`
3. Body (JSON):
```json
{
  "examTitle": "Teste Matemática",
  "subject": "Matemática",
  "institution": "UEM",
  "fileBase64": "Texto do exame aqui para teste",
  "mimeType": "text/plain"
}
```
4. Enviar → Ver resposta com questões geradas pela IA

---

## 💰 Integrar Pagamentos Reais

### DPO PayGate (Recomendado)

1. Criar conta: https://www.dpogroup.com/mz/
2. Obter `COMPANY_TOKEN`
3. Atualizar `.env`:
```
DPO_COMPANY_TOKEN=seu_token_aqui
```

4. Modificar endpoint `/api/payments/initiate` para fazer chamada real:
```javascript
const axios = require('axios');

const response = await axios.post('https://secure.3gdirectpay.com/API/v6/', {
  CompanyToken: process.env.DPO_COMPANY_TOKEN,
  Request: 'createToken',
  Transaction: {
    PaymentAmount: amount,
    PaymentCurrency: 'MZN',
    CompanyRef: `EDUPREP-${Date.now()}`,
    customerEmail: email
  }
});
```

---

## 📊 Monitoramento

### Logs do servidor
O servidor mostra logs de todas as operações:
```
[IA] Processando exame: Teste Matemática - Matemática - UEM
[IA] Exame processado com sucesso: 10 questões
[Pagamento] Iniciado: 500 MZN - estudante@eduprep.com
```

---

## 🔒 Segurança

**IMPORTANTE:** Em produção:
1. Nunca expor a API Key no código frontend
2. Usar HTTPS (não HTTP)
3. Implementar autenticação (JWT)
4. Validar todos os inputs
5. Rate limiting para evitar abuso

---

## 📈 Custos Google Gemini

Com a API Key fornecida:
- ✅ **Gratuito:** até 1.500 requisições/dia
- ✅ **Gemini 1.5 Flash:** $0.075 por 1M tokens (se ultrapassar limite)

**Estimativa:** 100 exames/dia = ~$0.50/mês (bem dentro do limite gratuito)

---

## 🆘 Troubleshooting

### Erro: "GEMINI_API_KEY not configured"
- Verificar se o arquivo `.env` existe
- Verificar se a API Key está correta

### Erro: "Cannot connect to server"
- Verificar se o servidor está rodando (`npm start`)
- Verificar se a porta 3000 está livre
- No app, usar `http://SEU_IP:3000` (não localhost se testar em dispositivo físico)

### Erro: "Rate limit exceeded"
- Atingiu o limite de 1.500 req/dia
- Aguardar 24h ou fazer upgrade para versão paga

---

## 🚀 Deploy em Produção

### Opções de hosting gratuito:
1. **Render.com** - Gratuito até 750h/mês
2. **Railway.app** - $5 crédito gratuito
3. **Fly.io** - Gratuito até 3 apps

### Exemplo Render.com:
1. Criar conta: https://render.com
2. New → Web Service
3. Conectar repositório GitHub
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Adicionar variável de ambiente: `GEMINI_API_KEY`

---

## 📞 Suporte

Para dúvidas sobre:
- **Google Gemini:** https://ai.google.dev/docs
- **DPO PayGate:** sales.mz@dpogroup.com
- **M-Pesa:** mpesa@vm.co.mz
- **e-Mola:** emola@mcel.co.mz
