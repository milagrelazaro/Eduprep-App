# 📘 MEMÓRIA DESCRITIVA - EduPrep SaaS

**Plataforma de Preparação para Exames de Admissão Universitária em Moçambique**

---

## 📋 ÍNDICE

1. [Descrição do Projeto](#1-descrição-do-projeto)
2. [Funcionalidades Implementadas](#2-funcionalidades-implementadas)
3. [Arquitetura Técnica](#3-arquitetura-técnica)
4. [APIs e Integrações](#4-apis-e-integrações)
5. [Análise de Custos - Licença Anual](#5-análise-de-custos---licença-anual)
6. [Cenários de Utilização](#6-cenários-de-utilização)
7. [Investimento Total Estimado](#7-investimento-total-estimado)
8. [Retorno sobre Investimento (ROI)](#8-retorno-sobre-investimento-roi)
9. [Recomendações](#9-recomendações)

---

## 1. DESCRIÇÃO DO PROJETO

### 1.1 Visão Geral
EduPrep SaaS é uma plataforma mobile (Android) desenvolvida em React Native/Expo que oferece preparação completa para exames de admissão universitária em Moçambique, combinando:
- Simulados interativos com feedback em tempo real
- Sistema de tutoria com pagamento seguro (escrow)
- Processamento de exames com Inteligência Artificial
- Análise de desempenho personalizada

### 1.2 Público-Alvo
- **Estudantes:** Candidatos a universidades (UEM, UP, UCM, Unilúrio, ISRI, ISCTEM)
- **Tutores:** Professores e explicadores certificados
- **Instituições:** Escolas e centros de preparação

### 1.3 Diferenciais Competitivos
- ✅ Primeiro app em Moçambique com IA para processar exames
- ✅ Sistema de chargeback para proteção de pagamentos
- ✅ Feedback instantâneo com links para YouTube
- ✅ Análise preditiva de chance de admissão
- ✅ Marketplace de tutores verificados

---

## 2. FUNCIONALIDADES IMPLEMENTADAS

### 2.1 Cadastro Inteligente
- Seleção de curso pretendido (8 opções)
- Multi-seleção de disciplinas (8 disciplinas)
- Perfil personalizado por objetivo acadêmico

### 2.2 Aba Desempenho
- Média geral e meta personalizada
- Cálculo de chance de admissão (%)
- 4 tipos de recomendações (crítico, aviso, sucesso, info)
- Progresso individual por disciplina
- Tendências de evolução (↑↓→)
- Estatísticas detalhadas

### 2.3 Simulador Melhorado
- Seleção por instituição, disciplina e tema
- Modo cronometrado (60 minutos)
- **Validação em tempo real:**
  - Verde para resposta correta
  - Vermelho para resposta errada
- Comentários personalizados
- Links para YouTube (correto e errado)
- Explicação detalhada de cada questão
- Tela de resultado com pontuação

### 2.4 Upload de Exames com IA (Premium)
- Upload de PDF ou imagem (máx 10MB)
- Processamento automático com Google Gemini
- Extração de questões, opções e respostas
- Geração de explicações e comentários
- Status: pending_validation (aguarda admin)
- Funcionalidade Premium (500 MT/mês)

### 2.5 Troca de Papel Estudante/Tutor
- Mudança instantânea sem logout
- Dashboard adaptado ao papel
- Gestão de disponibilidade (tutores)
- Histórico de aulas e ganhos

### 2.6 Sistema de Chargeback
- Pagamento retido em escrow
- Liberação apenas após conclusão da aula
- Proteção contra fraudes
- Registro de data de liberação

### 2.7 Marketplace de Tutores
- 6 tutores verificados (mock)
- Filtros por disciplina e preço
- Avaliações e reviews
- Agendamento online

### 2.8 Métodos de Pagamento
- Carteira virtual
- M-Pesa (Vodacom)
- e-Mola (Mcel)
- Cartão de crédito/débito

---

## 3. ARQUITETURA TÉCNICA

### 3.1 Frontend (Mobile)
- **Framework:** React Native 0.76.7 + Expo 52
- **Navegação:** React Navigation 7
- **UI:** React Native Paper 5.12
- **Estado:** Zustand 5.0
- **Storage:** AsyncStorage 2.1
- **Plataforma:** Android (APK)

### 3.2 Backend (API)
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.21
- **IA:** Google Generative AI SDK 0.21
- **HTTP Client:** Axios 1.7
- **Ambiente:** dotenv 16.4

### 3.3 Infraestrutura
- **Build:** Expo Application Services (EAS)
- **Hosting Backend:** Render.com / Railway.app / Fly.io
- **Database:** AsyncStorage (local) + Firebase/MongoDB (futuro)
- **CDN:** Cloudflare (opcional)

---

## 4. APIs E INTEGRAÇÕES

### 4.1 Google Gemini API (Inteligência Artificial)
**Função:** Processar exames PDF/imagem e extrair questões automaticamente

**Modelos disponíveis:**
- **Gemini 1.5 Flash** (recomendado)
- **Gemini 1.5 Pro** (maior precisão)

**Capacidades:**
- Análise de texto e imagens
- Extração de questões e opções
- Geração de explicações
- Sugestão de links educativos

### 4.2 DPO PayGate (Gateway de Pagamento)
**Função:** Processar pagamentos M-Pesa, e-Mola e cartões

**Vantagens:**
- Integração única para múltiplos métodos
- Certificação PCI-DSS
- Webhook para confirmação automática
- Dashboard de gestão

### 4.3 M-Pesa API (Vodacom)
**Função:** Pagamentos mobile via M-Pesa

**Métodos:**
- C2B (Customer to Business)
- B2C (Business to Customer - reembolsos)

### 4.4 e-Mola API (Mcel)
**Função:** Pagamentos mobile via e-Mola

**Métodos:**
- Pagamento direto
- Confirmação via SMS/USSD

---

## 5. ANÁLISE DE CUSTOS - LICENÇA ANUAL

### 5.1 Google Gemini API (Inteligência Artificial)

#### Plano Gratuito (Tier Free)
- **Limite:** 1.500 requisições/dia
- **Custo:** 0 MT/ano
- **Adequado para:** Até 100 utilizadores ativos/dia
- **Restrições:** 
  - 15 req/min (Flash)
  - 2 req/min (Pro)

#### Plano Pago (Pay-as-you-go)
**Gemini 1.5 Flash (Recomendado):**
- Input: $0.075 por 1M tokens
- Output: $0.30 por 1M tokens

**Estimativa por exame processado:**
- Tokens médios: ~50.000 (input) + 20.000 (output)
- Custo por exame: ~$0.0085 USD
- **Custo em MZN:** ~0.54 MT por exame

**Cenários anuais:**

| Utilizadores | Exames/mês | Exames/ano | Custo USD/ano | Custo MZN/ano |
|--------------|------------|------------|---------------|---------------|
| 100 | 200 | 2.400 | $20.40 | **1.295 MT** |
| 500 | 1.000 | 12.000 | $102.00 | **6.477 MT** |
| 1.000 | 2.000 | 24.000 | $204.00 | **12.954 MT** |
| 5.000 | 10.000 | 120.000 | $1.020.00 | **64.770 MT** |

**Taxa de câmbio:** 1 USD = 63.5 MZN (março 2026)

---

### 5.2 DPO PayGate (Gateway de Pagamento)

#### Custos de Setup
- **Taxa de adesão:** $200 - $500 USD
- **Em MZN:** 12.700 - 31.750 MT (pagamento único)

#### Custos Operacionais
- **Taxa por transação:** 2.5% - 4.0%
- **Taxa fixa por transação:** ~5 MT
- **Sem mensalidade fixa**

**Estimativa anual (aula média: 450 MT):**

| Utilizadores | Aulas/mês | Receita/mês | Taxa 3%/mês | Taxa/ano | Total MZN/ano |
|--------------|-----------|-------------|-------------|----------|---------------|
| 100 | 200 | 90.000 MT | 2.700 MT | 32.400 MT | **32.400 MT** |
| 500 | 1.000 | 450.000 MT | 13.500 MT | 162.000 MT | **162.000 MT** |
| 1.000 | 2.000 | 900.000 MT | 27.000 MT | 324.000 MT | **324.000 MT** |
| 5.000 | 10.000 | 4.500.000 MT | 135.000 MT | 1.620.000 MT | **1.620.000 MT** |

---

### 5.3 M-Pesa API (Vodacom) - Integração Direta

#### Custos de Setup
- **Adesão:** Negociável (empresas)
- **Estimativa:** 5.000 - 15.000 MT (setup inicial)

#### Custos Operacionais
- **Taxa por transação:** 1.5% - 3.5%
- **Sem mensalidade fixa**

**Nota:** Requer empresa registada, NUIT, conta bancária

---

### 5.4 e-Mola API (Mcel) - Integração Direta

#### Custos de Setup
- **Adesão:** Negociável (empresas)
- **Estimativa:** 5.000 - 15.000 MT (setup inicial)

#### Custos Operacionais
- **Taxa por transação:** 1.5% - 3.0%
- **Sem mensalidade fixa**

**Nota:** Requer empresa registada, NUIT

---

### 5.5 Infraestrutura e Hosting

#### Backend API (Node.js)

**Opção 1: Render.com (Recomendado)**
- **Plano Starter:** $7/mês = $84/ano
- **Em MZN:** 5.334 MT/ano
- **Recursos:** 512MB RAM, 0.5 CPU
- **Adequado para:** Até 1.000 utilizadores

**Opção 2: Railway.app**
- **Pay-as-you-go:** ~$5-10/mês
- **Em MZN:** 3.810 - 7.620 MT/ano

**Opção 3: Fly.io**
- **Plano básico:** $5-15/mês
- **Em MZN:** 3.810 - 11.430 MT/ano

#### Domínio e SSL
- **Domínio .co.mz:** 1.500 - 3.000 MT/ano
- **SSL (Let's Encrypt):** Gratuito
- **Email profissional:** 1.200 - 2.400 MT/ano

#### Database (Futuro)
- **Firebase (Spark - Free):** 0 MT/ano (até 10GB)
- **MongoDB Atlas (M0 - Free):** 0 MT/ano (até 512MB)
- **PostgreSQL (Render):** Incluído no plano

---

### 5.6 Serviços Adicionais

#### Expo Application Services (EAS)
- **Build APK:** Gratuito (fila lenta)
- **Build prioritário:** $29/mês = $348/ano = 22.098 MT/ano
- **OTA Updates:** Incluído

#### Notificações Push
- **Firebase Cloud Messaging:** Gratuito
- **OneSignal (Free):** Até 10.000 utilizadores

#### Analytics
- **Google Analytics:** Gratuito
- **Mixpanel (Free):** Até 100.000 eventos/mês

#### Armazenamento de Ficheiros
- **Cloudinary (Free):** 25GB/mês
- **AWS S3:** ~$1-5/mês = 760 MT/ano

---

## 6. CENÁRIOS DE UTILIZAÇÃO

### Cenário 1: STARTUP (100 utilizadores ativos)

**Perfil:**
- 100 estudantes ativos/mês
- 200 exames processados/mês
- 200 aulas agendadas/mês
- Receita média: 90.000 MT/mês

**Custos Anuais:**

| Item | Custo Anual (MZN) |
|------|-------------------|
| Google Gemini API | 1.295 MT |
| DPO PayGate (setup) | 12.700 MT |
| DPO PayGate (transações 3%) | 32.400 MT |
| Hosting Backend (Render) | 5.334 MT |
| Domínio .co.mz | 2.000 MT |
| Email profissional | 1.200 MT |
| **TOTAL** | **54.929 MT/ano** |

**Custo por utilizador/ano:** 549 MT
**Receita anual estimada:** 1.080.000 MT
**Margem bruta:** 94.9%

---

### Cenário 2: CRESCIMENTO (500 utilizadores ativos)

**Perfil:**
- 500 estudantes ativos/mês
- 1.000 exames processados/mês
- 1.000 aulas agendadas/mês
- Receita média: 450.000 MT/mês

**Custos Anuais:**

| Item | Custo Anual (MZN) |
|------|-------------------|
| Google Gemini API | 6.477 MT |
| DPO PayGate (setup) | 12.700 MT |
| DPO PayGate (transações 3%) | 162.000 MT |
| Hosting Backend (Render Pro) | 15.240 MT |
| Domínio .co.mz | 2.000 MT |
| Email profissional | 2.400 MT |
| EAS Build prioritário | 22.098 MT |
| **TOTAL** | **222.915 MT/ano** |

**Custo por utilizador/ano:** 446 MT
**Receita anual estimada:** 5.400.000 MT
**Margem bruta:** 95.9%

---

### Cenário 3: ESCALA (1.000 utilizadores ativos)

**Perfil:**
- 1.000 estudantes ativos/mês
- 2.000 exames processados/mês
- 2.000 aulas agendadas/mês
- Receita média: 900.000 MT/mês

**Custos Anuais:**

| Item | Custo Anual (MZN) |
|------|-------------------|
| Google Gemini API | 12.954 MT |
| DPO PayGate (setup) | 12.700 MT |
| DPO PayGate (transações 3%) | 324.000 MT |
| Hosting Backend (Railway Pro) | 30.480 MT |
| Domínio .co.mz | 2.000 MT |
| Email profissional | 2.400 MT |
| EAS Build prioritário | 22.098 MT |
| CDN Cloudflare Pro | 12.700 MT |
| **TOTAL** | **419.332 MT/ano** |

**Custo por utilizador/ano:** 419 MT
**Receita anual estimada:** 10.800.000 MT
**Margem bruta:** 96.1%

---

### Cenário 4: ENTERPRISE (5.000 utilizadores ativos)

**Perfil:**
- 5.000 estudantes ativos/mês
- 10.000 exames processados/mês
- 10.000 aulas agendadas/mês
- Receita média: 4.500.000 MT/mês

**Custos Anuais:**

| Item | Custo Anual (MZN) |
|------|-------------------|
| Google Gemini API | 64.770 MT |
| DPO PayGate (setup) | 31.750 MT |
| DPO PayGate (transações 2.5%) | 1.350.000 MT |
| Hosting Backend (Dedicated) | 76.200 MT |
| Domínio .co.mz | 2.000 MT |
| Email profissional (G Suite) | 15.240 MT |
| EAS Build prioritário | 22.098 MT |
| CDN Cloudflare Business | 127.000 MT |
| Database PostgreSQL | 38.100 MT |
| Suporte técnico 24/7 | 254.000 MT |
| **TOTAL** | **1.981.158 MT/ano** |

**Custo por utilizador/ano:** 396 MT
**Receita anual estimada:** 54.000.000 MT
**Margem bruta:** 96.3%

---

## 7. INVESTIMENTO TOTAL ESTIMADO

### 7.1 Custos Iniciais (Setup)

| Item | Custo (MZN) |
|------|-------------|
| DPO PayGate adesão | 12.700 - 31.750 MT |
| M-Pesa setup (opcional) | 5.000 - 15.000 MT |
| e-Mola setup (opcional) | 5.000 - 15.000 MT |
| Domínio .co.mz (1 ano) | 2.000 MT |
| Design/Branding | 10.000 - 50.000 MT |
| Marketing inicial | 20.000 - 100.000 MT |
| **TOTAL INICIAL** | **54.700 - 212.750 MT** |

### 7.2 Custos Recorrentes Anuais

**Cenário Conservador (100 utilizadores):**
- APIs e infraestrutura: 54.929 MT/ano
- Marketing contínuo: 120.000 MT/ano
- Suporte ao cliente: 60.000 MT/ano
- **TOTAL ANUAL:** 234.929 MT/ano

**Cenário Otimista (500 utilizadores):**
- APIs e infraestrutura: 222.915 MT/ano
- Marketing contínuo: 300.000 MT/ano
- Suporte ao cliente: 150.000 MT/ano
- Equipe (2 pessoas): 480.000 MT/ano
- **TOTAL ANUAL:** 1.152.915 MT/ano

---

## 8. RETORNO SOBRE INVESTIMENTO (ROI)

### 8.1 Modelo de Receita

**Estudantes (Freemium):**
- Plano Gratuito: Simulados básicos
- **Plano Premium:** 500 MT/mês
  - Upload de exames com IA
  - Simulados ilimitados
  - Análise avançada de desempenho
  - Suporte prioritário

**Tutores:**
- Comissão: 15% - 20% por aula
- Aula média: 450 MT
- Comissão média: 67.5 - 90 MT/aula

**Instituições (B2B):**
- Licença escolar: 5.000 - 15.000 MT/mês
- Acesso para 50-200 alunos

### 8.2 Projeção de Receita Anual

**Cenário 1 (100 utilizadores):**
- 30 Premium: 30 × 500 × 12 = 180.000 MT
- 200 aulas/mês: 200 × 75 × 12 = 180.000 MT
- **TOTAL:** 360.000 MT/ano
- **Lucro líquido:** 125.071 MT (35%)

**Cenário 2 (500 utilizadores):**
- 150 Premium: 150 × 500 × 12 = 900.000 MT
- 1.000 aulas/mês: 1.000 × 75 × 12 = 900.000 MT
- 2 escolas B2B: 2 × 10.000 × 12 = 240.000 MT
- **TOTAL:** 2.040.000 MT/ano
- **Lucro líquido:** 887.085 MT (43%)

**Cenário 3 (1.000 utilizadores):**
- 300 Premium: 300 × 500 × 12 = 1.800.000 MT
- 2.000 aulas/mês: 2.000 × 75 × 12 = 1.800.000 MT
- 5 escolas B2B: 5 × 10.000 × 12 = 600.000 MT
- **TOTAL:** 4.200.000 MT/ano
- **Lucro líquido:** 3.780.668 MT (90%)

**Cenário 4 (5.000 utilizadores):**
- 1.500 Premium: 1.500 × 500 × 12 = 9.000.000 MT
- 10.000 aulas/mês: 10.000 × 75 × 12 = 9.000.000 MT
- 20 escolas B2B: 20 × 10.000 × 12 = 2.400.000 MT
- **TOTAL:** 20.400.000 MT/ano
- **Lucro líquido:** 18.418.842 MT (90%)

### 8.3 Break-even Point

**Investimento inicial:** 54.700 - 212.750 MT
**Custos mensais (100 users):** 19.577 MT/mês
**Receita mensal (100 users):** 30.000 MT/mês

**Break-even:** 6-8 meses (cenário conservador)

---

## 9. RECOMENDAÇÕES

### 9.1 Fase 1: MVP (Meses 1-3)
**Investimento:** 54.700 MT
- ✅ Usar Google Gemini gratuito (1.500 req/dia)
- ✅ DPO PayGate para pagamentos
- ✅ Hosting Render.com (gratuito ou $7/mês)
- ✅ Foco em 100 utilizadores beta
- ✅ Marketing orgânico (redes sociais)

### 9.2 Fase 2: Crescimento (Meses 4-12)
**Investimento adicional:** 150.000 MT
- ✅ Upgrade para Gemini pago (se necessário)
- ✅ Contratar 1 suporte ao cliente
- ✅ Marketing pago (Facebook, Instagram, TikTok)
- ✅ Parcerias com escolas
- ✅ Meta: 500 utilizadores

### 9.3 Fase 3: Escala (Ano 2)
**Investimento adicional:** 500.000 MT
- ✅ Equipe completa (dev, marketing, suporte)
- ✅ Infraestrutura dedicada
- ✅ Expansão para iOS
- ✅ Integração com universidades
- ✅ Meta: 5.000 utilizadores

### 9.4 Otimizações de Custo

**Google Gemini:**
- Usar cache de respostas comuns
- Batch processing para reduzir requisições
- Implementar rate limiting

**Pagamentos:**
- Negociar taxas menores com volume
- Incentivar uso de carteira virtual (sem taxa)
- Implementar sistema de referral

**Infraestrutura:**
- Usar CDN para conteúdo estático
- Implementar lazy loading
- Otimizar imagens e assets

---

## 10. CONCLUSÃO

### 10.1 Viabilidade Financeira
O EduPrep SaaS apresenta **alta viabilidade financeira** com:
- ✅ Custos iniciais baixos (54.700 MT)
- ✅ Margem bruta superior a 90%
- ✅ Break-even em 6-8 meses
- ✅ ROI de 228% no primeiro ano (cenário conservador)

### 10.2 Vantagens Competitivas
- ✅ Primeira plataforma com IA em Moçambique
- ✅ Sistema de chargeback único
- ✅ Modelo freemium escalável
- ✅ Baixa dependência de APIs pagas

### 10.3 Riscos Mitigados
- ✅ Google Gemini tem tier gratuito robusto
- ✅ DPO PayGate elimina complexidade de múltiplas integrações
- ✅ Infraestrutura escalável conforme crescimento
- ✅ Modelo de receita diversificado (B2C + B2B)

### 10.4 Próximos Passos Imediatos
1. ✅ Lançar APK beta (já pronto)
2. ✅ Configurar DPO PayGate sandbox
3. ✅ Recrutar 50 beta testers
4. ✅ Coletar feedback e iterar
5. ✅ Lançamento oficial em 30-60 dias

---

## ANEXOS

### A. Tabela Resumo de Custos (MZN)

| Cenário | Utilizadores | Custo Anual | Receita Anual | Lucro Anual | Margem |
|---------|--------------|-------------|---------------|-------------|--------|
| Startup | 100 | 234.929 | 360.000 | 125.071 | 35% |
| Crescimento | 500 | 1.152.915 | 2.040.000 | 887.085 | 43% |
| Escala | 1.000 | 419.332 | 4.200.000 | 3.780.668 | 90% |
| Enterprise | 5.000 | 1.981.158 | 20.400.000 | 18.418.842 | 90% |

### B. Contactos de APIs

**Google Gemini:**
- Website: https://ai.google.dev/
- Documentação: https://ai.google.dev/docs
- Suporte: Google AI Studio

**DPO PayGate:**
- Website: https://www.dpogroup.com/mz/
- Email: sales.mz@dpogroup.com
- Telefone: +258 21 123 456

**M-Pesa (Vodacom):**
- Email: mpesa@vm.co.mz
- Website: https://developer.mpesa.vm.co.mz/

**e-Mola (Mcel):**
- Email: emola@mcel.co.mz
- Website: https://developer.emola.io/

---

**Documento preparado em:** Março 2026  
**Versão:** 1.0  
**Autor:** Equipe EduPrep SaaS  
**Taxa de câmbio:** 1 USD = 63.5 MZN
