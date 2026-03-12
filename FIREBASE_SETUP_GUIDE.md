# 🔥 Firebase Setup Guide - EduPrep

## 📋 **O QUE PRECISA CONFIGURAR NO FIREBASE**

### **1. Acessar Firebase Console**
- URL: https://console.firebase.google.com
- Login com sua conta Google
- Projeto: `fitness-app-realtime`

---

## 🔧 **CONFIGURAÇÕES OBRIGATÓRIAS**

### **Authentication (Autenticação)**
1. No menu lateral → **Authentication**
2. Clique em **"Get started"**
3. Ative **"Email/Password"**:
   - Status: ✅ ENABLED
   - Email password: ✅ ENABLED
4. **NÃO ative** outros provedores por enquanto

### **Firestore Database**
1. Menu lateral → **Firestore Database**
2. Clique em **"Create database"**
3. Configurações:
   - **Start in test mode** ✅
   - **Location**: `us-central1` (ou mais próxima)
4. **Rules** (iniciar com teste):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.time < timestamp.date(2025, 1, 1);
       }
     }
   }
   ```

### **Storage (Para imagens)**
1. Menu lateral → **Storage**
2. Clique em **"Get started"**
3. **Rules** (iniciar com teste):
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if request.time < timestamp.date(2025, 1, 1);
       }
     }
   }
   ```

---

## 📊 **CRIAR COLEÇÕES FIRESTORE**

### **Coleções necessárias:**
```
/users          - Usuários do app
/tutors         - Perfis de tutores
/exams          - Exames criados
/lessons        - Aulas agendadas
/posts          - Posts do feed
/examResults    - Resultados dos simulados
/notifications  - Notificações
```

### **Como criar (opcional):**
- As coleções são criadas automaticamente quando o app adiciona dados
- Não precisa criar manualmente

---

## 🔍 **COMO TESTAR SE ESTÁ FUNCIONANDO**

### **1. Verificar Configurações**
No Firebase Console:
- ✅ Authentication → Email/Password enabled
- ✅ Firestore Database → Criada
- ✅ Storage → Configurado

### **2. Testar Conexão**
1. Abra o app EduPrep
2. Vá para **Perfil** → **Firebase**
3. Ative a opção "Sincronização Firebase"
4. Faça login/cadastro
5. Verifique no Firebase Console → **Firestore Data**

### **3. Verificar Dados**
No Firebase Console → **Firestore Data**:
- Deve aparecer documentos na coleção `users`
- Cada usuário tem: name, email, role, avatar, status

---

## 🚀 **PASSOS PARA TESTAR COMPLETO**

### **Passo 1: Configurar Firebase**
```bash
# 1. Faça login no Firebase CLI
firebase login

# 2. Selecione o projeto
firebase use fitness-app-realtime

# 3. Verifique configuração
firebase projects:list
```

### **Passo 2: Iniciar App**
```bash
# No diretório do app
npx expo start --web --port 8085
```

### **Passo 3: Testar no App**
1. Abra http://localhost:8085
2. Faça login como estudante
3. Vá para Perfil → Firebase
4. Ative "Sincronização Firebase"
5. Crie um post no feed
6. Verifique no Firebase Console

---

## 📱 **COMO VER DADOS NO FIREBASE**

### **Firestore Data**
1. Firebase Console → Firestore Database
2. Clique em "Start collection" (se necessário)
3. Veja as coleções criadas:
   - `users` - Dados dos usuários
   - `posts` - Posts do feed
   - `exams` - Exames criados

### **Storage**
1. Firebase Console → Storage
2. Veja os arquivos de imagens (quando upload)

### **Authentication**
1. Firebase Console → Authentication
2. Veja os usuários registrados

---

## ⚠️ **PROBLEMAS COMUNS E SOLUÇÕES**

### **"Permission denied"**
- **Causa:** Firestore Rules muito restritivas
- **Solução:** Use regras de teste temporariamente

### **"No such document"**
- **Causa:** Coleção não criada ou usuário não encontrado
- **Solução:** Verifique se o modo Firebase está ativado no app

### **"Network error"**
- **Causa:** Sem internet ou projeto Firebase errado
- **Solução:** Verifique conexão e ID do projeto

### **"Firebase not initialized"**
- **Causa:** Configuração Firebase incorreta
- **Solução:** Verifique `firebaseConfig` no app

---

## 🎯 **CHECKLIST FINAL**

### **Firebase Console:**
- [ ] Authentication → Email/Password ✅
- [ ] Firestore Database → Criada ✅
- [ ] Storage → Configurado ✅
- [ ] Projeto: `fitness-app-realtime` ✅

### **App EduPrep:**
- [ ] Abre em http://localhost:8085 ✅
- [ ] Login funciona ✅
- [ ] Perfil → Firebase aparece ✅
- [ ] Toggle Firebase funciona ✅

### **Teste Final:**
1. [ ] Faça login no app
2. [ ] Ative Firebase no perfil
3. [ ] Crie um post
4. [ ] Verifique no Firebase Console → Firestore Data
5. [ ] Veja o documento na coleção `users`

---

## 🆘 **SE PRECISAR DE AJUDA**

### **Comandos úteis:**
```bash
# Verificar projeto atual
firebase projects:list

# Mudar de projeto
firebase use fitness-app-realtime

# Verificar configuração
firebase firestore:databases:list

# Deploy (se necessário)
firebase deploy
```

### **Logs do app:**
- Abra o console do navegador (F12)
- Veja os logs com 🔥 emoji
- Erros aparecem em vermelho

---

## 🎉 **QUANDO ESTIVER TUDO FUNCIONANDO**

Você verá:
- ✅ App funcionando normalmente
- ✅ Toggle Firebase no perfil
- ✅ Dados aparecendo no Firebase Console
- ✅ Posts sincronizados entre usuários
- ✅ Backup automático na nuvem

**Parabéns! Seu app estará com Firebase funcionando!** 🚀
