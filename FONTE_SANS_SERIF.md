# 🔤 Configuração de Fonte Sans-Serif

## ✅ Implementação Completa

### **1. Tema Global (src/theme/index.ts)**

Todas as fontes do React Native Paper foram configuradas para usar `fontFamily: 'System'`:

- ✅ **Títulos** (h1, h2, h3)
- ✅ **Corpo** (bodyLarge, bodyMedium, bodySmall)
- ✅ **Menus** (menuTitle, menuSubtitle)
- ✅ **Botões** (button, buttonSmall)
- ✅ **Labels** (labelLarge, labelMedium, labelSmall)
- ✅ **Headlines** (headlineLarge, headlineMedium, headlineSmall)
- ✅ **Displays** (displayLarge, displayMedium, displaySmall)

### **2. Typography (src/theme/colors.ts)**

Todos os estilos de tipografia incluem `fontFamily: 'System'`:

```typescript
export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    fontFamily: 'System', // ✅ Sans-serif nativo
  },
  // ... todos os outros estilos
};
```

### **3. Fonte "System"**

A fonte `System` é a fonte sans-serif nativa de cada plataforma:

- **iOS**: San Francisco (SF Pro)
- **Android**: Roboto
- **Web**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

### **4. Vantagens da Fonte System**

✅ **Performance**: Fonte já instalada no sistema  
✅ **Consistência**: Aparência nativa em cada plataforma  
✅ **Legibilidade**: Otimizada para telas digitais  
✅ **Sem downloads**: Não precisa carregar fontes externas  
✅ **Acessibilidade**: Suporta todos os pesos e variações  

### **5. Como Usar nos Componentes**

#### **Opção 1: Usar estilos do tema**
```tsx
import { typography } from '../theme/colors';

<Text style={typography.h1}>Título</Text>
<Text style={typography.bodyMedium}>Texto</Text>
```

#### **Opção 2: Usar componentes Paper**
```tsx
import { Text } from 'react-native-paper';

<Text variant="headlineMedium">Título</Text>
<Text variant="bodyMedium">Texto</Text>
```

#### **Opção 3: Estilo inline**
```tsx
<Text style={{ fontFamily: 'System' }}>Texto</Text>
```

### **6. Aplicação Automática**

O tema do React Native Paper (`src/theme/index.ts`) já aplica automaticamente a fonte System em todos os componentes Paper (Card, Button, TextInput, etc).

### **7. Verificação**

Para verificar se a fonte está aplicada:

1. Abra o app no navegador ou dispositivo
2. Inspecione qualquer texto
3. A fonte deve ser:
   - **iOS/Safari**: San Francisco
   - **Android/Chrome**: Roboto
   - **Web**: System sans-serif

## 🎯 Resultado Final

✅ **100% Sans-Serif** - Toda a aplicação usa fonte sans-serif nativa  
✅ **Consistente** - Mesma configuração em todas as telas  
✅ **Performático** - Sem necessidade de carregar fontes externas  
✅ **Moderno** - Visual limpo e profissional  

## 📝 Notas Técnicas

- A fonte `System` é um alias que React Native resolve automaticamente para a fonte sans-serif padrão de cada plataforma
- Não é necessário instalar ou importar fontes adicionais
- Todos os pesos (100-900) são suportados nativamente
- A fonte se adapta automaticamente às configurações de acessibilidade do sistema
