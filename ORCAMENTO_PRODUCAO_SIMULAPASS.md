# Orçamento de Produção — SimulaPass / EduPrep

**Projeto:** `c:\iProjects\eduprep-unificado`  
**Stack:** Expo 52 + React Native 0.76.9 + Firebase (Auth/Firestore/Storage) + Node.js backend + Google Gemini  
**Objetivo:** Publicar app Android na Play Store, colocar backend/DB em produção e garantir operação estável.

---

## 1. Resumo Executivo

O app está funcional em modo **demo/teste** com as seguintes pendências críticas para produção:

1. Firebase atual é o projeto `fitness-app-realtime` (não pertence à marca EduPrep/SimulaPass).
2. **Backend Node.js tem erros e inseguranças**: variável `anthropic` não declarada, chave Gemini hardcoded no frontend (`src/config/ai.ts`), prompt diz "Claude" mas usa Gemini, e CSV parser muito frágil.
3. Sistema de pagamentos está **simulado** (M-Pesa/E-Mola/PayGate ainda não são reais).
4. Build web (`dist/`) existe, mas **não há AAB/APK Android assinado** para Play Store.
5. Vários PDFs de exames estão na raiz do repositório — devem ser removidos do bundle e movidos para Firebase Storage.

---

## 2. Escopo de Trabalho para Produção

| Item | Descrição | Estimativa (h) |
|------|-----------|----------------|
| **A. Preparação Firebase** | Criar projeto Firebase próprio (`eduprep-prod` ou `simulapass-prod`), configurar Authentication, Firestore, Storage, Hosting, Analytics, Crashlytics, App Check e regras de segurança. | 12 |
| **B. Migração de Dados** | Replicar os 14 exames e estrutura de collections/users do projeto antigo para o novo Firebase; limpar duplicados. | 6 |
| **C. Correção do Backend** | Corrigir `backend/server.js` (bug `anthropic`, variáveis de ambiente, rota de health); mover chave Gemini para env; validar CSV com parser robusto; adicionar autenticação. | 12 |
| **D. Deploy do Backend** | Subir Node.js para cloud (Render/Railway/VPS) com HTTPS, variáveis de ambiente, CORS e webhook para pagamentos. | 6 |
| **E. Build Android** | Configurar EAS, gerar keystores, build AAB (`production`), assinatura e testes internos. | 8 |
| **F. Play Store** | Criar conta Google Play ($25), preparar listing, screenshots, ícone, splash, privacy policy, termos, classificação de conteúdo, testes internos/closed. | 10 |
| **G. Hardening do App** | Remover chaves expostas do frontend, configurar Expo Updates, revisar permissões Android e reduzir tamanho do bundle. | 8 |
| **H. Testes e Entrega** | Testes de regressão, smoke tests, build final e entrega de documentação. | 6 |
| **I. Documentação** | Criar manual de deploy, variáveis de ambiente e troubleshooting. | 2 |
| **Total mão de obra** | | **70 h** |

**Valor estimado da mão de obra:**
- A 2.000 MZN/h: **140.000 MZN**
- A 2.500 MZN/h: **175.000 MZN**

> Valor ajustável conforme acordo de taxa horária ou pacote fechado.

---

## 3. Custos de Infraestrutura e Lojas

### 3.1 Firebase (produção)

| Serviço | Plano / Custo aprox. (mensal) |
|---------|-------------------------------|
| Firebase Spark/Blaze | Começa gratuito; estimativa realista com 1.000–5.000 usuários ativos: **$25–$80/mês** (≈ 1.600 – 5.120 MZN) |
| Firebase Storage | PDFs dos exames e imagens: **$5–$20/mês** (≈ 320 – 1.280 MZN) |
| Firebase Auth | Até 10k usuários/mês grátis; depois **$0,01/10k verificações** (irrisório no início) |

**Recomendação:** começar no plano **Blaze** com orçamento de **$30/mês** (≈ 1.920 MZN).

### 3.2 Hosting do Backend

| Opção | Custo mensal | Notas |
|-------|--------------|-------|
| Render (Starter) | $7/mês | ≈ 450 MZN; fácil, Postgres incluído se necessário |
| Railway | $5/mês+ | ≈ 320 MZN; escala por uso |
| Contabo VPS 4GB | ~$6/mês | ≈ 385 MZN; mais controle, exige gestão |
| DigitalOcean Droplet | $6/mês | ≈ 385 MZN; sem backups automáticos |

**Recomendação:** Render Starter ou Railway para menos manutenção: **≈ 450 MZN/mês**.

### 3.3 Play Store

| Item | Custo | Notas |
|------|-------|-------|
| Taxa de conta Google Play | **$25** (único) | ≈ 1.600 MZN |
| Publicação AAB | Incluído | Build gerenciado pela Play Console |
| Atualizações futuras | Incluído | Novas versões sem custo adicional |

### 3.4 Google Gemini (IA de upload de exames)

| Uso | Custo aprox. |
|-----|--------------|
| Plano Free | 1.500 requests/dia grátis |
| Excedente | ~$0,35 / milhão de tokens de saída (texto); PDFs custam mais por causa de tokens de entrada |
| Estimativa realista | **$10–$30/mês** (≈ 640 – 1.920 MZN) se houver upload moderado |

**Recomendação:** manter uso racional ou cobrar por upload premium para controlar custo.

### 3.5 Domínio e E-mail

| Item | Custo anual | Notas |
|------|-------------|-------|
| Domínio `.co.mz` | 5.000–15.000 MZN/ano | Depende do registrador (GoDaddy, Hostinger, local) |
| Domínio `.com` | ~$12/ano | ≈ 770 MZN |
| E-mail profissional (Google Workspace) | $6/usuário/mês | Opcional |

---

## 4. Custos Opcionais Recomendados

| Item | Estimativa | Descrição |
|------|------------|-----------|
| Integração M-Pesa / E-Mola real | 40.000 – 70.000 MZN | Contrato com operadora + desenvolvimento + webhooks |
| Integração PayGate / DPO cartão | 30.000 – 50.000 MZN | Merchant account + gateway |
| Notificações push (FCM) | Incluído no Firebase | Configuração adicional: 8 h (≈ 16.000 MZN) |
| Analytics e dashboards | 8 h | Configurar Firebase Analytics + eventos customizados |
| Otimização ASO / screenshots | 6 h | Melhorar discoverability na Play Store |

---

## 5. Orçamento Mensal Recorrente Estimado

| Serviço | Custo mensal (MZN) |
|---------|---------------------|
| Firebase Blaze (médio) | 1.920 |
| Backend (Render Starter) | 450 |
| Gemini API | 640 |
| Domínio (prorrateado) | 400 |
| **Total infraestrutura** | **~3.410 MZN/mês** |

> Valor pode subir com tráfego. Acompanhar no painel do Firebase e Render.

---

## 6. Investimento Inicial Total (estimativa)

| Componente | Custo (MZN) |
|------------|-------------|
| Mão de obra de produção (70 h a 2.000 MZN/h) | 140.000 |
| Taxa Google Play | 1.600 |
| Primeiro mês de infraestrutura | 3.410 |
| Domínio (anual) | 8.000 |
| **Total inicial** | **~153.010 MZN** |

Se taxa horária for 2.500 MZN/h: **~183.010 MZN**.

---

## 7. Cronograma Previsto

| Fase | Duração |
|------|---------|
| Preparação Firebase + migração | 3 dias |
| Correção e deploy do backend | 3 dias |
| Build Android + testes internos | 2 dias |
| Play Store + documentação | 2 dias |
| Ajustes finais e entrega | 2 dias |
| **Total** | **~12 dias úteis** |

---

## 8. Riscos e Dependências

1. **Chave Gemini exposta** (`AIzaSyDhr3WU8yOXMzkoedbzeHiiGA7gWq_-rPY` em `.env.example` e `src/config/ai.ts`). Deve ser revogada e substituída; todas as chamadas de IA devem passar pelo backend.
2. **Backend `server.js` não compila/funciona em produção** sem correção da variável `anthropic` e do fluxo CSV.
3. **Play Store pode rejeitar o app** se as capturas de ecrã, política de privacidade ou classificação de conteúdo estiverem incompletas.
4. **Taxa de câmbio** USD/MZN pode alterar os custos da Google Cloud, Render e Play Store.
5. **Não há garantia de aprovação imediata** na Play Store — pode levar de 1 a 7 dias por revisão.

---

## 9. Próximos Passos Sugeridos

1. Aprovar orçamento e definir taxa horária/pacote.
2. Criar projeto Firebase EduPrep/SimulaPass e convidar a equipa técnica.
3. Comprar domínio e conta Google Play ($25).
4. Revogar chave Gemini atual e gerar nova no Google AI Studio.
5. Iniciar fase de correção do backend e build EAS.

---

*Orçamento elaborado com base no estado do projeto em 11 de Setembro de 2026.*  
*Valores são estimativas e podem ser ajustados após revisão detalhada.*
