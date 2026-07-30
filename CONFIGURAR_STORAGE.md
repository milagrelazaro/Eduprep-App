# 🔧 Configurar Firebase Storage - URGENTE

## ⚠️ Problema Atual
O Firebase Storage não está ativado no projeto `fitness-app-realtime`, causando erro de CORS ao fazer upload de imagens.

## ✅ Solução (Passo a Passo)

### 1. **Ativar Firebase Storage**
1. Acesse: https://console.firebase.google.com/project/fitness-app-realtime/storage
2. Clique em **"Get Started"** ou **"Começar"**
3. Escolha o modo de segurança:
   - **Modo de Produção** (recomendado) - Requer autenticação
   - Ou **Modo de Teste** - Acesso público temporário (30 dias)
4. Clique em **"Avançar"**
5. Escolha a localização: **us-central1** (ou mais próxima)
6. Clique em **"Concluir"**

### 2. **Aplicar Regras de Segurança**
Após ativar o Storage, execute no terminal:

```bash
cd c:\iProjects\eduprep-unificado
firebase deploy --only storage
```

### 3. **Configurar CORS (Opcional - se ainda houver erro)**
Se o erro de CORS persistir, configure manualmente:

1. Instale o Google Cloud SDK: https://cloud.google.com/sdk/docs/install
2. Execute:
```bash
gcloud auth login
gsutil cors set cors.json gs://fitness-app-realtime.firebasestorage.app
```

## 📋 Regras de Storage Criadas

O arquivo `storage.rules` já foi criado com as seguintes permissões:

- ✅ **Leitura pública** de todas as imagens
- ✅ **Upload de questões** apenas para usuários autenticados
- ✅ **Upload de avatares** apenas para o próprio usuário

## 🔍 Verificar se Funcionou

Após configurar, teste:
1. Acesse: https://fitness-app-realtime.web.app
2. Faça login como Admin
3. Vá em **Gestão de Exames** → **Adicionar Exame** → **Cadastro Manual**
4. Tente adicionar uma questão com imagem
5. Se não houver erro de CORS, está funcionando! ✅

## 📱 Alternativa Rápida (Modo Teste)

Se precisar testar rapidamente, use estas regras temporárias no Console Firebase:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **ATENÇÃO:** Estas regras são INSEGURAS! Use apenas para testes.

## 🎯 Próximos Passos

1. ✅ Ativar Storage no Console
2. ✅ Deploy das regras: `firebase deploy --only storage`
3. ✅ Testar upload de imagem
4. ✅ Commit e push das alterações
