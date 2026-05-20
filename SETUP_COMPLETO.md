# 🚀 Setup Completo - EduPrep SaaS

## ✅ Estado Atual do Projeto

### Dados Reais Implementados
- ✅ **14 exames PDF reais** de universidades moçambicanas (UEM, UP, UCM, Unilúrio, ISRI, ISCTEM)
- ✅ **Catálogo de exames** com filtros por instituição, disciplina, ano e status
- ✅ **Sistema de upload** com processamento IA (placeholder funcional)
- ✅ **Chat limpo**: apenas conversa demo inicial, permite criar novas conversas
- ✅ **Feed conectado ao Firebase**: carrega posts reais, fallback para AsyncStorage
- ✅ **CTA "Treinar Agora"** funcional: navega para ExamCenter e inicia simulados reais

### Integrações Configuradas

#### Firebase (Projeto fornecido pelo cliente)
```
Project ID: fitness-app-realtime
Auth Domain: fitness-app-realtime.firebaseapp.com
Storage Bucket: fitness-app-realtime.firebasestorage.app
API Key: AIzaSyDkrZwgzFDb8x_aCaD-XCVFXDokrJiQGDE
```

#### Google Gemini IA (Plano Free)
```
API Key: AIzaSyDhr3WU8yOXMzkoedbzeHiiGA7gWq_-rPY
Modelo: gemini-1.5-flash
Limite: 1.500 requisições/dia (gratuito)
```

---

## 📦 Instalação e Build

### 1. Instalar Dependências

```bash
cd c:\Users\reborn\Videos\iProjects\eduprep-unificado\eduprep-unificado\eduprep-unificado
npm install --include=dev
```

**Nota:** As dependências já estão alinhadas. O conflito anterior entre `@types/react` e `@types/react-dom` foi resolvido.

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (copie de `.env.example`):

```bash
GEMINI_API_KEY=AIzaSyDhr3WU8yOXMzkoedbzeHiiGA7gWq_-rPY
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyDhr3WU8yOXMzkoedbzeHiiGA7gWq_-rPY
API_URL=http://localhost:3000
```

### 3. Seed de Exames no Firebase (IMPORTANTE!)

**Os exames agora são sincronizados com Firebase + AsyncStorage para uso online/offline.**

```bash
# Limpar exames duplicados/teste do Firestore
npx ts-node scripts/cleanDuplicateExams.ts

# Popular Firebase com os 14 exames reais
npx ts-node scripts/seedFirebaseExams.ts
```

**O que acontece:**
- ✅ App carrega exames do **Firebase primeiro** (online)
- ✅ Fallback para **AsyncStorage** se offline
- ✅ Uploads são salvos em **Firebase + local**
- ✅ Sincronização automática ao abrir o app

**Verificar no Firebase Console:**
- URL: https://console.firebase.google.com/project/fitness-app-realtime/firestore
- Coleção: `exams`
- Deve ter **14 documentos** com status `approved`

### 4. Build com EAS (já logado)

```bash
eas build --platform android --profile preview
```

**Ou para produção:**

```bash
eas build --platform android --profile production
```

---

## 🧪 Testar Localmente

### Desenvolvimento com Expo Go

```bash
npx expo start
```

Escaneie o QR code com o app Expo Go (Android) ou câmera (iOS).

### Desenvolvimento com Emulador

```bash
npx expo run:android
```

---

## 👥 Contas Demo para Teste

### Estudante
```
Email: estudante@eduprep.co.mz
Senha: eduprep123
```

### Professor/Tutor
```
Email: tutor@eduprep.co.mz
Senha: eduprep123
```

### Administrador
```
Email: admin@eduprep.co.mz
Senha: eduprep123
```

---

## 📋 Fluxos Principais

### 1. Simulados de Exames (Online/Offline)
1. Login como estudante
2. Dashboard → Botão "Treinar Agora" (ou aba Exames)
3. **App carrega exames do Firebase** (se online) ou **AsyncStorage** (se offline)
4. Filtrar por instituição/disciplina/ano
5. Clicar "Treinar Agora" em um exame aprovado
6. Responder questões (validação em tempo real)
7. Finalizar e ver resultado com recomendações IA

### 2. Upload de Exames (Premium + Sincronização)
1. Aba Exames → Botão "Adicionar Exame"
2. Preencher título, disciplina e instituição
3. Selecionar PDF (simula escolha de arquivo real)
4. Processar com IA (placeholder de 3 segundos)
5. **Exame salvo no Firebase + AsyncStorage** automaticamente
6. Status inicial: "pending_validation"
7. Aparece para todos os usuários após aprovação

### 3. Chat com Tutores
1. Aba Mensagens → Botão "+" (Nova Conversa)
2. Pesquisar tutor por nome ou disciplina
3. Selecionar e iniciar conversa
4. Enviar mensagens (persistidas em AsyncStorage)

### 4. Feed de Notícias
1. Aba Feed
2. Ver posts do Firebase (ou cache local se offline)
3. Curtir, comentar, compartilhar
4. Criar novo post com botão "+"

---

## 🔧 Arquivos Importantes

### Configuração
- `src/config/firebase.ts` - Credenciais Firebase
- `src/config/ai.ts` - Configuração Gemini IA
- `src/constants/integrations.ts` - Constantes de integração

### Serviços
- `src/services/firebaseService.ts` - Interação com Firestore/Auth/Storage
- `src/services/examCatalogService.ts` - Gestão do catálogo de exames

### Stores (Zustand)
- `src/store/authStore.ts` - Autenticação e usuário
- `src/store/feedStore.ts` - Posts do feed (Firebase + AsyncStorage)
- `src/store/chatStore.ts` - Conversas e mensagens

### Dados
- `src/data/mockData.ts` - Exames reais com questões mockadas
- `src/utils/initializeData.ts` - Seed inicial do catálogo

---

## 🐛 Troubleshooting

### Erro: "Cannot find module '@types/react'"
```bash
npm install --save-dev @types/react@~18.3.0 @types/react-dom@~18.3.0
```

### Erro: "Firebase not initialized"
Verifique se `src/config/firebase.ts` está importado em `App.tsx`.

### Erro: "Gemini API Key not found"
Certifique-se de que `.env` existe e contém `EXPO_PUBLIC_GEMINI_API_KEY`.

### Exames não aparecem
Execute o app uma vez para seed inicial. Verifique AsyncStorage key `eduprep_exam_catalog`.

### Feed vazio
O feed carrega do Firebase. Se offline, usa cache. Crie posts manualmente para testar.

---

## 📊 Limites e Custos

### Google Gemini (Plano Free)
- **1.500 requisições/dia** (gratuito)
- Adequado para até 100 usuários ativos/dia
- Se ultrapassar: ~0.54 MT por exame processado

### Firebase (Plano Spark - Free)
- **10GB armazenamento** (gratuito)
- **50.000 leituras/dia** (gratuito)
- **20.000 escritas/dia** (gratuito)

### Expo EAS Build
- **Build gratuito** (fila lenta, ~20-30 min)
- **Build prioritário**: $29/mês (fila rápida, ~5-10 min)

---

## 🎯 Próximos Passos

### Para Produção
1. ✅ Criar projeto Firebase próprio (ou usar o fornecido)
2. ✅ Configurar regras de segurança Firestore
3. ⏳ Implementar backend Node.js para processamento IA real
4. ⏳ Integrar DPO PayGate para pagamentos
5. ⏳ Configurar notificações push (Firebase Cloud Messaging)
6. ⏳ Deploy backend em Render.com ou Railway.app

### Para Testes
1. ✅ Rodar `npm install --include=dev`
2. ✅ Fazer build com `eas build --platform android --profile preview`
3. ⏳ Distribuir APK para testers via EAS Submit ou link direto
4. ⏳ Coletar feedback e iterar

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique `CREDENCIAIS_TESTE.md` para contas demo
2. Consulte `MEMORIA_DESCRITIVA_EDUPREP.md` para especificações
3. Revise `FIREBASE_INTEGRATION_GUIDE.md` para detalhes Firebase
4. Leia `backend-example/README.md` para setup do backend IA

---

**Última atualização:** 9 de abril de 2026  
**Status:** ✅ Pronto para build e testes
