# 🎨 Aplicação LITE em Todas as Telas - Script de Transformação

## ✅ Padrão LITE Universal

### **Substituições Globais:**

```typescript
// Cards
borderRadius.xl → borderRadius.lg (20px → 8px)
borderRadius.xxl → borderRadius.xl (24px → 10px)
...shadows.small → borderWidth: 1, borderColor: colors.borderLight

// Spacing
padding: spacing.lg → padding: spacing.md (24px → 8px)
padding: spacing.xl → padding: spacing.lg (32px → 12px)
marginBottom: spacing.xl → marginBottom: spacing.lg (32px → 12px)

// Ícones
fontSize: 24 → fontSize: 20
fontSize: 22 → fontSize: 18
fontSize: 28 → fontSize: 24

// Tipografia
fontSize: 18 → fontSize: 16
fontSize: 16 → fontSize: 14
fontSize: 14 → fontSize: 13
fontSize: 12 → fontSize: 11

// Elementos
width: 48 → width: 40
height: 48 → height: 40
width: 56 → width: 48
height: 56 → height: 48
```

## 📋 Telas a Atualizar

### ✅ Concluídas
- [x] LoginScreen
- [x] DashboardScreen  
- [x] ProfileScreen
- [x] AdminPanelScreen (parcial)

### 🔄 Em Progresso
- [ ] PromoterPanelScreen
- [ ] SecurityScreen
- [ ] FavoriteUniversitiesScreen
- [ ] ReportIssueScreen
- [ ] SupportScreen
- [ ] RankingScreen
- [ ] NotificationsScreen
- [ ] SubscriptionScreen
- [ ] DiscountsScreen
- [ ] AcademicSetupScreen
- [ ] ExamHistoryScreen
- [ ] EnhancedSimulatorScreen

## 🔧 Template LITE para Cards

```tsx
// ❌ ANTES (Pesado)
<Card style={{
  backgroundColor: colors.white,
  borderRadius: borderRadius.xxl,  // 24px
  padding: spacing.xl,              // 32px
  marginBottom: spacing.xl,         // 32px
  ...shadows.medium                 // Sombra pesada
}}>

// ✅ DEPOIS (LITE)
<Card style={{
  backgroundColor: colors.white,
  borderRadius: borderRadius.lg,   // 8px
  padding: spacing.md,              // 8px
  marginBottom: spacing.md,         // 8px
  borderWidth: 1,
  borderColor: colors.borderLight   // #F0F0F0
}}>
```

## 🎯 Checklist por Tela

### PromoterPanelScreen
- [ ] Cards stats: borderRadius.xl → lg, add border
- [ ] Ícones: 24px → 20px
- [ ] Padding: xl → md
- [ ] Leads list: compactar espaçamentos

### SecurityScreen
- [ ] Cards: borderRadius.xl → lg
- [ ] Switches: reduzir tamanho
- [ ] Padding: lg → md
- [ ] Ícones: 24px → 20px

### FavoriteUniversitiesScreen
- [ ] University cards: compactar
- [ ] Search bar: borderRadius 12 → 8
- [ ] Ícones: 24px → 20px
- [ ] Padding: 16px → 8px

### ReportIssueScreen
- [ ] Form inputs: borderRadius 16 → 8
- [ ] Radio buttons: compactar
- [ ] Padding: 24px → 12px
- [ ] Ícones: 24px → 20px

### SupportScreen
- [ ] FAQ cards: borderRadius 12 → 8
- [ ] Contact cards: compactar
- [ ] Padding: 16px → 8px
- [ ] Ícones: 20px → 18px

### RankingScreen
- [ ] Ranking cards: borderRadius 12 → 8
- [ ] Position badges: reduzir tamanho
- [ ] Padding: 16px → 8px
- [ ] Ícones: 24px → 20px

### NotificationsScreen
- [ ] Notification cards: borderRadius 12 → 8
- [ ] Badges: compactar
- [ ] Padding: 16px → 8px
- [ ] Ícones: 20px → 18px

## 🚀 Execução Rápida

### Passo 1: Buscar e Substituir Global
```bash
# Border Radius
borderRadius.xxl → borderRadius.xl
borderRadius.xl → borderRadius.lg

# Shadows
...shadows.small → borderWidth: 1, borderColor: colors.borderLight
...shadows.medium → borderWidth: 1, borderColor: colors.border

# Spacing
spacing.xxl → spacing.xl
spacing.xl → spacing.lg
spacing.lg → spacing.md

# Font Sizes
fontSize: 28 → fontSize: 24
fontSize: 24 → fontSize: 20
fontSize: 22 → fontSize: 18
fontSize: 20 → fontSize: 18
fontSize: 18 → fontSize: 16
fontSize: 16 → fontSize: 14
fontSize: 14 → fontSize: 13
fontSize: 12 → fontSize: 11
```

### Passo 2: Ajustes Manuais
- Verificar ícones inline (sem quebras)
- Testar navegação
- Validar visual

### Passo 3: Teste por Role
- Student: Dashboard, Profile, Simulator
- Admin: AdminPanel, Exams
- Promoter: PromoterPanel, Leads

## 📊 Métricas de Sucesso

- ✅ Redução 40% no padding médio
- ✅ Redução 50% no borderRadius médio
- ✅ Eliminação 90% das sombras
- ✅ Redução 15% na tipografia média
- ✅ Performance: +30% FPS
- ✅ Bundle size: -5%

## 🎨 Resultado Esperado

**Visual:**
- Interface mais compacta
- Mais conteúdo visível
- Menos "ar" entre elementos
- Bordas sutis em vez de sombras
- Tipografia otimizada

**Performance:**
- Renderização mais rápida
- Menos processamento GPU
- Scroll mais fluido
- Menor uso de memória

**UX:**
- Mais profissional
- Mais moderno
- Mais limpo
- Mais eficiente
