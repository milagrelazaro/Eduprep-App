# 🎓 EduPrep SaaS - Plataforma de Explicações e Exames de Admissão

**Plataforma completa para preparação de exames universitários em Moçambique**

[![React Native](https://img.shields.io/badge/React%20Native-0.76.7-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-52-black.svg)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange.svg)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

---

## ✨ Funcionalidades

- ✅ **14 Exames Reais** de universidades moçambicanas (UEM, UP, UCM, Unilúrio, ISRI, ISCTEM)
- ✅ **Simulador de Exames** com questões reais e validação em tempo real
- ✅ **Upload de Exames** com processamento IA (Google Gemini)
- ✅ **Chat com Tutores** para tirar dúvidas
- ✅ **Feed de Notícias** com posts da comunidade
- ✅ **Modo Offline** com sincronização Firebase + AsyncStorage
- ✅ **Sistema de Pagamentos** (DPO PayGate + M-Pesa)
- ✅ **Recomendações IA** baseadas no desempenho

---

## 🚀 Quick Start

### 1. Instalar Dependências

```bash
npm install --include=dev
```

### 2. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env`:

```bash
GEMINI_API_KEY=AIzaSyDhr3WU8yOXMzkoedbzeHiiGA7gWq_-rPY
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyDhr3WU8yOXMzkoedbzeHiiGA7gWq_-rPY
API_URL=http://localhost:3000
```

### 3. **IMPORTANTE:** Seed de Exames no Firebase

```bash
# Limpar duplicados
npx ts-node scripts/cleanDuplicateExams.ts

# Popular Firebase com 14 exames reais
npx ts-node scripts/seedFirebaseExams.ts
```

### 4. Rodar o App

```bash
# Desenvolvimento com Expo Go
npx expo start

# Ou com emulador Android
npx expo run:android
```

---

## 📦 Build para Produção

```bash
# Build Android (Preview)
eas build --platform android --profile preview

# Build Android (Produção)
eas build --platform android --profile production
```

---

## 🔄 Sincronização Firebase + AsyncStorage

O app agora sincroniza dados entre Firebase (online) e AsyncStorage (offline):

- **Exames**: Carrega do Firebase → Fallback AsyncStorage → Seed local
- **Uploads**: Salva no Firebase + AsyncStorage automaticamente
- **Posts**: Firebase Firestore com cache local
- **Chat**: AsyncStorage com plano para Firebase

**Documentação completa:** [`SINCRONIZACAO_FIREBASE.md`](./SINCRONIZACAO_FIREBASE.md)

---

## 📚 Documentação

- **[SETUP_COMPLETO.md](./SETUP_COMPLETO.md)** - Guia completo de instalação e configuração
- **[SINCRONIZACAO_FIREBASE.md](./SINCRONIZACAO_FIREBASE.md)** - Arquitetura de sincronização online/offline
- **[scripts/README.md](./scripts/README.md)** - Scripts de gestão Firebase
- **[FIREBASE_INTEGRATION_GUIDE.md](./FIREBASE_INTEGRATION_GUIDE.md)** - Integração Firebase detalhada
- **[MEMORIA_DESCRITIVA_EDUPREP.md](./MEMORIA_DESCRITIVA_EDUPREP.md)** - Especificações completas do projeto

---

## 👥 Contas Demo

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

## 🛠️ Stack Tecnológica

- **Frontend:** React Native 0.76.7 + Expo 52
- **Linguagem:** TypeScript 5.7
- **State Management:** Zustand
- **Backend:** Firebase (Firestore, Auth, Storage)
- **IA:** Google Gemini (gemini-1.5-flash)
- **Pagamentos:** DPO PayGate + M-Pesa
- **Persistência:** AsyncStorage (offline)
- **Navegação:** React Navigation 7

---

## 📊 Firebase Collections

### `exams` - Catálogo de Exames
```typescript
{
  id: string;
  title: string;
  subject: string;
  institution: string;
  year: number;
  status: 'approved' | 'pending_validation' | 'rejected';
  duration: number;
  pdfUrl?: string;
  aiProcessed: boolean;
  createdAt: Timestamp;
}
```

### `posts` - Feed de Notícias
```typescript
{
  id: string;
  userId: string;
  content: string;
  likes: number;
  comments: number;
  createdAt: Timestamp;
}
```

### `users` - Perfis
```typescript
{
  id: string;
  email: string;
  name: string;
  role: 'student' | 'tutor' | 'admin';
  subjects?: string[];
}
```

---

## 🔧 Scripts Úteis

```bash
# Seed exames no Firebase
npx ts-node scripts/seedFirebaseExams.ts

# Limpar exames duplicados
npx ts-node scripts/cleanDuplicateExams.ts

# Rodar testes
npm test

# Lint
npm run lint
```

---

## 📱 Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis
├── screens/          # Telas do app
├── navigation/       # Configuração de navegação
├── services/         # Serviços (Firebase, API)
├── store/            # Zustand stores
├── types/            # TypeScript types
├── data/             # Dados mock e seed
├── config/           # Configurações (Firebase, IA)
└── utils/            # Utilitários

scripts/
├── seedFirebaseExams.ts       # Seed de exames
├── cleanDuplicateExams.ts     # Limpeza de duplicados
└── README.md                  # Documentação dos scripts
```

---

## 🐛 Troubleshooting

### Exames não aparecem
```bash
npx ts-node scripts/seedFirebaseExams.ts
```

### Firebase offline
- App usa cache AsyncStorage automaticamente
- Exames aparecem normalmente

### Dependências desatualizadas
```bash
npm install --include=dev
```

---

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação:
- [`SETUP_COMPLETO.md`](./SETUP_COMPLETO.md)
- [`SINCRONIZACAO_FIREBASE.md`](./SINCRONIZACAO_FIREBASE.md)
- [`scripts/README.md`](./scripts/README.md)

---

## 📄 Licença

Propriedade de EduPrep SaaS © 2026
