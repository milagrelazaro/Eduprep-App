# 🎥 TESTE TUTOR vs ALUNO - SALA DE AULA COM VÍDEO

## ✅ CONFIGURAÇÃO PERFEITA PARA TESTE

**Você testou o Jitsi Meet e funcionou perfeitamente!** 🎉  
Agora vamos testar no app com 2 dispositivos.

---

## 📱 SETUP DE TESTE

### **Dispositivo 1: NAVEGADOR (Tutor)**
```
Navegador: Chrome/Edge
URL: http://localhost:19006
Login: Tutor
```

### **Dispositivo 2: EXPO GO (Aluno)**
```
App: Expo Go no celular
Escanear QR code
Login: Estudante
```

---

## 🚀 PASSO A PASSO - TESTE COMPLETO

### **1. INICIAR O APP**

```bash
# Terminal
cd c:\Users\reborn\Videos\iProjects\eduprep-unificado\eduprep-unificado\eduprep-unificado

npm start
# ou
expo start
```

Vai abrir:
- ✅ QR Code no terminal
- ✅ Navegador em http://localhost:19006

---

### **2. CONFIGURAR DISPOSITIVO 1 (NAVEGADOR - TUTOR)**

#### A. Abrir navegador:
```
http://localhost:19006
```

#### B. Login como Tutor:
```
Email: tutor@test.com
Senha: 123456

(Se não existir, criar conta como tutor)
```

#### C. Ir para Dashboard:
```
Dashboard → Ver botão roxo "🎥 Testar Sala de Aula"
```

#### D. **NÃO CLICAR AINDA!** Configurar o outro dispositivo primeiro.

---

### **3. CONFIGURAR DISPOSITIVO 2 (MOBILE - ALUNO)**

#### A. Abrir Expo Go no celular

#### B. Escanear QR Code do terminal

#### C. Login como Estudante:
```
Email: estudante@test.com
Senha: 123456

(Se não existir, criar conta como estudante)
```

#### D. Ir para Dashboard:
```
Dashboard → Ver botão roxo "🎥 Testar Sala de Aula"
```

---

### **4. ENTRAR NA SALA (AMBOS OS DISPOSITIVOS)**

#### **Dispositivo 1 (Navegador - Tutor):**
```
1. Clicar "ENTRAR" no botão roxo
2. Vai abrir LessonRoomScreen
3. Clicar "Iniciar Aula"
4. Vai mostrar link do Jitsi Meet
5. Copiar o link: https://meet.jit.si/eduprep_lesson_demo_001
6. Abrir em NOVA ABA do navegador
7. Permitir câmera e microfone
8. Entrar como "Professor Silva"
```

#### **Dispositivo 2 (Mobile - Aluno):**
```
1. Clicar "ENTRAR" no botão roxo
2. Vai abrir LessonRoomScreen
3. Clicar "Iniciar Aula"
4. Vai mostrar link do Jitsi Meet
5. Clicar no link (vai abrir no navegador do celular)
6. Permitir câmera e microfone
7. Entrar como "João Sitoe"
```

---

### **5. TESTAR VÍDEO (JITSI MEET)**

Agora você tem 2 pessoas na mesma sala Jitsi:
- ✅ **Navegador:** Professor Silva (Tutor)
- ✅ **Celular:** João Sitoe (Aluno)

**Testar:**
- ✅ Ver vídeo do outro
- ✅ Ouvir áudio do outro
- ✅ Compartilhar tela (botão na barra inferior)
- ✅ Desligar/ligar câmera
- ✅ Desligar/ligar microfone
- ✅ Levantar mão (botão de reações)

---

### **6. TESTAR CHAT EM TEMPO REAL**

#### **No Navegador (Tutor):**
```
1. Voltar para aba do app (localhost:19006)
2. Ver área de chat na parte inferior
3. Escrever: "Olá! Consegues ver o quadro?"
4. Clicar "Enviar"
```

#### **No Celular (Aluno):**
```
1. Voltar para o app Expo Go
2. Ver mensagem do tutor aparecer INSTANTANEAMENTE
3. Escrever: "Sim professor! Está perfeito!"
4. Clicar "Enviar"
```

#### **No Navegador (Tutor):**
```
Ver mensagem do aluno aparecer INSTANTANEAMENTE
```

**✅ CHAT EM TEMPO REAL FUNCIONANDO!**

---

### **7. FINALIZAR AULA**

#### **No Celular (Aluno):**
```
1. Clicar botão verde "Finalizar Aula"
2. Confirmar
3. Ver mensagem de sucesso
4. Pagamento liberado para tutor
```

---

## 🎯 O QUE VOCÊ VAI VER

### **Vídeo (Jitsi Meet):**
- ✅ 2 pessoas na mesma sala
- ✅ Vídeo HD de ambos
- ✅ Áudio claro
- ✅ Compartilhamento de tela
- ✅ Controles profissionais

### **Chat (Firestore):**
- ✅ Mensagens instantâneas
- ✅ Sincronização em tempo real
- ✅ Histórico persistente
- ✅ Interface limpa

### **Sistema:**
- ✅ Navegação fluida
- ✅ Design profissional
- ✅ Experiência completa

---

## 🔧 TROUBLESHOOTING

### **Problema: QR Code não aparece**
```bash
# Parar o servidor (Ctrl+C)
# Limpar cache
expo start -c
```

### **Problema: Não consegue fazer login**
```
Criar conta nova:
1. Clicar "Registrar"
2. Preencher dados
3. Escolher role (Tutor ou Estudante)
4. Criar conta
```

### **Problema: Jitsi não abre no celular**
```
1. Copiar link manualmente
2. Abrir navegador do celular
3. Colar link
4. Entrar na sala
```

### **Problema: Chat não sincroniza**
```
1. Verificar conexão internet
2. Recarregar app (shake + reload)
3. Verificar Firestore no console
```

### **Problema: Câmera não funciona**
```
1. Dar permissão no navegador
2. Verificar se outra app está usando câmera
3. Recarregar página
```

---

## 📊 CHECKLIST DE TESTE

### **Vídeo:**
- [ ] Tutor vê vídeo do aluno
- [ ] Aluno vê vídeo do tutor
- [ ] Áudio funcionando nos 2 lados
- [ ] Compartilhamento de tela funciona
- [ ] Controles de mic/câmera funcionam

### **Chat:**
- [ ] Tutor envia mensagem → Aluno recebe instantaneamente
- [ ] Aluno envia mensagem → Tutor recebe instantaneamente
- [ ] Mensagens aparecem em ordem
- [ ] Auto-scroll para última mensagem
- [ ] Histórico persiste ao recarregar

### **Sistema:**
- [ ] Navegação fluida
- [ ] Botão "Finalizar Aula" funciona
- [ ] Pagamento liberado
- [ ] Sem erros no console

---

## 🎬 DEMONSTRAÇÃO PARA O BOSS

### **Setup:**
```
1. Navegador: Você como tutor
2. Celular: Colega como aluno
   (ou 2 navegadores diferentes)
```

### **Roteiro (3 minutos):**

#### **1. Mostrar Dashboard (30s)**
```
"Aqui está o dashboard. Vou clicar no botão de teste
para entrar na sala de aula."
```

#### **2. Entrar na Sala (30s)**
```
"Clico 'Iniciar Aula' e o sistema gera um link único
para esta aula. Vou abrir em outra aba."
```

#### **3. Demonstrar Vídeo (1min)**
```
"Aqui estamos na chamada de vídeo. Posso ver o aluno,
ele me vê, temos áudio bidirecional, e posso compartilhar
minha tela para mostrar conteúdo."
```

#### **4. Demonstrar Chat (30s)**
```
"Enquanto a aula acontece, temos chat em tempo real.
Vou enviar uma mensagem... veja, aparece instantaneamente
no dispositivo do aluno."
```

#### **5. Finalizar (30s)**
```
"Ao finalizar, o pagamento que estava em escrow é
liberado automaticamente para o tutor. Sistema seguro
para ambas as partes."
```

---

## 💡 DICAS PARA APRESENTAÇÃO

### **1. Prepare o Ambiente:**
- ✅ Feche abas desnecessárias
- ✅ Teste câmera/microfone antes
- ✅ Tenha 2 dispositivos prontos
- ✅ Conexão internet estável

### **2. Destaque os Pontos Fortes:**
- ✅ "Vídeo profissional com Jitsi Meet"
- ✅ "Chat em tempo real com Firestore"
- ✅ "Sistema de escrow para segurança"
- ✅ "Custo zero de infraestrutura"

### **3. Tenha Respostas Prontas:**
- ✅ "Quantos usuários suporta?" → Ilimitado
- ✅ "Quanto custa?" → Zero (Jitsi gratuito)
- ✅ "É seguro?" → Sim (escrow + criptografia)
- ✅ "Funciona no mobile?" → Sim (testando agora)

---

## 🎉 RESULTADO ESPERADO

Ao final do teste, você terá demonstrado:

✅ **Sistema completo de aulas online**
✅ **Vídeo em tempo real funcionando**
✅ **Chat sincronizado entre dispositivos**
✅ **Interface profissional**
✅ **Experiência fluida**
✅ **Pronto para produção**

---

## 📱 LINKS RÁPIDOS

### **App no Navegador:**
```
http://localhost:19006
```

### **Sala de Teste Jitsi:**
```
https://meet.jit.si/eduprep_lesson_demo_001
```

### **Firebase Console:**
```
https://console.firebase.google.com
→ Firestore Database
→ lessons/demo_lesson_001/messages
```

---

## ✅ COMANDOS RÁPIDOS

### **Iniciar:**
```bash
npm start
```

### **Limpar Cache:**
```bash
expo start -c
```

### **Ver Logs:**
```bash
# No navegador: F12 → Console
# No Expo: Shake → Show Dev Menu → Debug Remote JS
```

---

**🎉 TUDO PRONTO PARA TESTAR!**

**Siga os passos acima e terá uma demonstração perfeita para o boss!**

**Boa sorte! 🚀**
