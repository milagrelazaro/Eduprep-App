const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Inicializar Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDhr3WU8yOXMzkoedbzeHiiGA7gWq_-rPY');

// Endpoint: Processar exame com IA
app.post('/api/exams/process', async (req, res) => {
  try {
    const { examTitle, subject, institution, fileBase64, mimeType } = req.body;

    if (!fileBase64) {
      return res.status(400).json({ error: 'Ficheiro não fornecido' });
    }

    console.log(`[IA] Processando exame: ${examTitle} - ${subject} - ${institution}`);

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Você é um assistente especializado em processar exames de admissão universitária em Moçambique.

Analise este exame de ${subject} da instituição ${institution} e extraia:

1. Todas as questões do exame
2. Opções de resposta (A, B, C, D ou E)
3. Resposta correta (índice 0-4)
4. Explicação detalhada de cada questão
5. Comentário para resposta correta (motivacional + link YouTube sugerido)
6. Comentário para resposta errada (orientação + link YouTube sugerido)

IMPORTANTE: Retorne APENAS um JSON válido, sem markdown ou texto adicional.

Formato JSON esperado:
{
  "examTitle": "${examTitle}",
  "subject": "${subject}",
  "institution": "${institution}",
  "totalQuestions": 0,
  "questions": [
    {
      "id": 1,
      "question": "Texto da questão aqui",
      "options": ["A) Opção 1", "B) Opção 2", "C) Opção 3", "D) Opção 4"],
      "correctAnswer": 2,
      "explanation": "Explicação detalhada da resposta",
      "correctComment": "Excelente! Você domina este conceito. Continue assim!",
      "wrongComment": "Revise este conceito. Foque em [tópico específico].",
      "youtubeCorrect": "https://youtube.com/watch?v=exemplo1",
      "youtubeWrong": "https://youtube.com/watch?v=exemplo2"
    }
  ]
}
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: fileBase64,
          mimeType: mimeType || 'application/pdf'
        }
      }
    ]);

    const responseText = result.response.text();
    
    // Limpar markdown se houver
    const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const processedExam = JSON.parse(jsonText);

    console.log(`[IA] Exame processado com sucesso: ${processedExam.totalQuestions} questões`);

    res.json({
      success: true,
      exam: processedExam,
      message: `Exame processado com sucesso! ${processedExam.totalQuestions} questões extraídas.`
    });

  } catch (error) {
    console.error('[IA] Erro ao processar exame:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao processar exame com IA',
      details: error.message
    });
  }
});

// Endpoint: Iniciar pagamento DPO PayGate
app.post('/api/payments/initiate', async (req, res) => {
  try {
    const { amount, email, phone, description } = req.body;

    // Simulação de integração DPO PayGate
    // Em produção, fazer chamada real à API DPO
    const mockPaymentToken = `DPO-${Date.now()}`;
    const mockPaymentUrl = `https://secure.3gdirectpay.com/payv2.php?ID=${mockPaymentToken}`;

    console.log(`[Pagamento] Iniciado: ${amount} MZN - ${email}`);

    res.json({
      success: true,
      paymentToken: mockPaymentToken,
      paymentUrl: mockPaymentUrl,
      amount: amount,
      currency: 'MZN',
      message: 'Pagamento iniciado com sucesso'
    });

  } catch (error) {
    console.error('[Pagamento] Erro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao iniciar pagamento',
      details: error.message
    });
  }
});

// Endpoint: Callback de pagamento (webhook)
app.post('/api/payments/callback', async (req, res) => {
  try {
    const { transactionToken, companyRef, transactionStatus } = req.body;

    console.log(`[Pagamento] Callback recebido: ${transactionToken} - Status: ${transactionStatus}`);

    // Atualizar status do pagamento no banco de dados
    // Liberar conteúdo/aula para o usuário

    res.json({ success: true });

  } catch (error) {
    console.error('[Pagamento] Erro no callback:', error);
    res.status(500).json({ success: false });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   EduPrep SaaS - Backend API Server       ║
║   Porta: ${PORT}                              ║
║   Google Gemini: ${process.env.GEMINI_API_KEY ? '✓ Configurado' : '✗ Não configurado'}      ║
╚════════════════════════════════════════════╝
  `);
});
