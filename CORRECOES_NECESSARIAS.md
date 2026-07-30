# 🔧 Correções Necessárias - SimulaPass LITE

## ❌ Problemas Identificados

### 1. Erros "Unexpected text node"
**Causa:** Quebras de linha entre tags JSX criam text nodes vazios
**Localização:** ProfileScreen, DashboardScreen, outras telas
**Solução:** Remover quebras de linha ou usar {' '}

### 2. Ícones não funcionam
**Causa:** Mistura de emojis com quebras de linha
**Solução:** Usar apenas emojis inline sem quebras

### 3. Leads do Promotor não carregam
**Causa:** Erro Firebase "failed-precondition" - falta índice no Firestore
**Solução:** Criar índice composto no Firebase Console

### 4. Layout não está LITE
**Causa:** Muitos cards, sombras pesadas, espaçamentos grandes
**Solução:** Simplificar drasticamente

## ✅ Estratégia de Correção

### FASE 1: Corrigir Erros Críticos (AGORA)
1. Remover quebras de linha nos ícones
2. Simplificar ProfileScreen
3. Corrigir DashboardScreen
4. Fixar PromoterPanelScreen

### FASE 2: Aplicar Estilo LITE Real
1. Reduzir sombras (elevation: 1, shadowOpacity: 0.03)
2. Espaçamentos menores (8px, 12px, 16px)
3. Cards mais finos (padding: 12px)
4. Bordas sutis (borderWidth: 1, borderColor: #f0f0f0)
5. Tipografia menor (12px, 14px, 16px)

### FASE 3: Otimizar Performance
1. Remover animações desnecessárias
2. Lazy load de imagens
3. Memoização de componentes

## 🎨 Padrão LITE Yango

```tsx
// ❌ ERRADO (Pesado)
<Card style={{ 
  backgroundColor: colors.white, 
  borderRadius: 24, 
  elevation: 8,
  shadowOpacity: 0.2,
  padding: 24,
  marginBottom: 20
}}>

// ✅ CORRETO (Lite)
<Card style={{ 
  backgroundColor: colors.white, 
  borderRadius: 8, 
  borderWidth: 1,
  borderColor: '#f0f0f0',
  padding: 12,
  marginBottom: 8
}}>
```

## 🚀 Ações Imediatas

1. **Corrigir ícones inline**
```tsx
// ❌ ERRADO
<Text>
  {item.icon === 'school' ? '🎓' : 
   item.icon === 'star' ? '⭐' : '⚙️'}
</Text>

// ✅ CORRETO
<Text>{item.icon === 'school' ? '🎓' : item.icon === 'star' ? '⭐' : '⚙️'}</Text>
```

2. **Criar índice Firebase para leads**
- Ir para Firebase Console
- Firestore Database > Indexes
- Criar índice composto: `referralLeads` (promoterId ASC, activationDate DESC)

3. **Simplificar cards**
- Remover sombras pesadas
- Usar bordas em vez de elevation
- Reduzir padding e margin

## 📝 Checklist de Correção

- [ ] ProfileScreen - remover quebras de linha
- [ ] DashboardScreen - simplificar layout
- [ ] PromoterPanelScreen - corrigir leads
- [ ] Todas as telas - aplicar estilo LITE
- [ ] Firebase - criar índices necessários
- [ ] Testar navegação completa
- [ ] Verificar performance

## 🎯 Resultado Esperado

- ✅ Zero erros no console
- ✅ Todos os ícones funcionando
- ✅ Leads carregando corretamente
- ✅ Layout verdadeiramente LITE (como Yango)
- ✅ Performance fluida
- ✅ Navegação sem travamentos
