# Credenciais de Teste - EduPrep

## Acesso Rápido para Demonstração

### Contas de Teste Pré-configuradas

| Perfil | Email | Senha | Descrição |
|--------|-------|-------|-----------|
| **Estudante** | `estudante@teste.eduprep` | `teste123` | Acesso como aluno para agendar aulas e fazer exames |
| **Professor** | `professor@teste.eduprep` | `teste123` | Acesso como tutor para dar aulas |
| **Admin** | `admin@eduprep.com` | `admin123` | Acesso administrativo completo |

---

## Funcionalidades Disponíveis

### 1. Sistema de Exames (14 PDFs Reais)
Os seguintes exames estão cadastrados e disponíveis para simulação:

#### Matemática
- `MATEMATICA-2022.pdf` (UEM/UP, 2022)
- `Mat-2021-Up.pdf` (UP, 2021)

#### Física
- `Fisica-2024.pdf` (UEM/UP, 2024)
- `fis-2021-UP.pdf` (UP, 2021)

#### Química
- `EXAME DE QUÍMICA UP 2024` (UP, 2024)
- `QUIMICA-2024.pdf` (UEM/UP, 2024)

#### Biologia
- `Biologia-2024.pdf` (UEM/UP, 2024)

#### Português
- `Exame da UP 2019 Portugues.pdf` (UP, 2019)
- `PORTUGUES I.pdf` (UEM/UP, 2024)

#### Outras Disciplinas
- `Ingles-2023.pdf` - Inglês (2023)
- `Historia-2023.pdf` - História (2023)
- `GEOGRAFIA-2024.pdf` - Geografia (2024)
- `FILOSOFIA-2024.pdf` - Filosofia (2024)
- `Frances.pdf` - Francês (2024)

---

### 2. Video Aulas (1000 Aulas Gratuitas)

**Status:** ✅ 1000 aulas gratuitas disponíveis para teste

#### Recursos Habilitados:
- ✅ Video chamada HD (720p)
- ✅ Compartilhamento de tela
- ✅ Quadro branco digital
- ✅ Chat em tempo real
- ✅ Gravação de aulas
- ✅ Levantar mão
- ✅ Até 2 participantes (professor + aluno)

#### Limites:
- Duração máxima: 120 minutos por aula
- Limite diário: 8 aulas
- Limite semanal: 40 aulas
- **Total disponível:** 1000 aulas para teste

---

### 3. Sistema de Chat/Mensagens

#### Funcionalidades:
- ✅ Chat em tempo real com professores
- ✅ Notificações de mensagens não lidas
- ✅ Status online/offline
- ✅ Histórico de conversas persistido
- ✅ Indicador de "mensagem lida"
- ✅ Conversas iniciais de demonstração

---

### 4. Feed Social

#### Funcionalidades:
- ✅ Criar publicações
- ✅ Curtir e comentar
- ✅ Filtrar por tipo (Notícias, Conquistas, Avisos)
- ✅ Buscar publicações
- ✅ Compartilhar conquistas de exames

---

## Como Usar

### Iniciar o Projeto

```bash
# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm start

# Ou iniciar diretamente para web
npm run web
```

### Fazer Login

1. Abra o aplicativo
2. Clique em "Entrar no Sistema"
3. Use uma das contas de teste acima
4. Explore as funcionalidades!

### Agendar uma Aula

1. Vá para a aba "Explicações"
2. Escolha um tutor
3. Clique em "Agendar Aula"
4. Selecione data e horário
5. Confirme (pagamento simulado em modo teste)

### Fazer um Exame

1. Vá para a aba "Exames"
2. Escolha a instituição (UEM, UP, etc.)
3. Selecione a disciplina
4. Clique em "Iniciar Simulador"
5. Responda as questões e veja o resultado

---

## Configuração Firebase

O projeto está configurado com Firebase para:
- Autenticação de usuários
- Banco de dados Firestore
- Storage para arquivos

**Nota:** Em modo de teste, algumas operações usam AsyncStorage local para facilitar a demonstração.

---

## Suporte

Para dúvidas ou problemas durante a demonstração:
- Use a conta de admin para acessar o painel administrativo
- Verifique os logs no console para debug
- As credenciais de teste resetam ao limpar o AsyncStorage

---

**Última atualização:** Abril 2026
**Versão:** 1.0.0 - Demo
