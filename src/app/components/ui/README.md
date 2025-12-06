# Design System - Componentes UI

Este diretório contém componentes reutilizáveis do design system da aplicação.

## Componentes Disponíveis

### Button
Componente de botão com múltiplas variantes e tamanhos.

**Uso:**
```html
<app-button variant="primary" size="md" (clicked)="handleClick()">
  Clique aqui
</app-button>

<app-button variant="danger" [loading]="isLoading">
  Deletar
</app-button>
```

**Propriedades:**
- `variant`: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean
- `fullWidth`: boolean
- `type`: 'button' | 'submit' | 'reset'
- `loading`: boolean

---

### Input
Componente de input com suporte a ControlValueAccessor.

**Uso:**
```html
<app-input
  type="email"
  placeholder="seu@email.com"
  size="md"
  [error]="hasError"
  [(ngModel)]="email"
></app-input>
```

**Propriedades:**
- `type`: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local'
- `placeholder`: string
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean
- `readonly`: boolean
- `error`: boolean
- `icon`: string
- `iconPosition`: 'left' | 'right'

---

### Card
Componente de card para agrupar conteúdo.

**Uso:**
```html
<app-card variant="elevated" [hoverable]="true">
  <h2>Título do Card</h2>
  <p>Conteúdo do card aqui...</p>
</app-card>
```

**Propriedades:**
- `variant`: 'default' | 'bordered' | 'elevated'
- `padding`: boolean
- `hoverable`: boolean

---

### Badge
Componente de badge/etiqueta para status e tags.

**Uso:**
```html
<app-badge variant="success" size="md">Ativo</app-badge>
<app-badge variant="warning" [outline]="true">Pendente</app-badge>
<app-badge variant="danger" [dot]="true">Erro</app-badge>
```

**Propriedades:**
- `variant`: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
- `size`: 'sm' | 'md' | 'lg'
- `dot`: boolean
- `outline`: boolean

---

### FormField
Wrapper para campos de formulário com label, hint e erro.

**Uso:**
```html
<app-form-field
  label="Email"
  [required]="true"
  htmlFor="email-input"
  [error]="emailError"
  hint="Digite seu melhor email"
>
  <app-input
    id="email-input"
    type="email"
    formControlName="email"
  ></app-input>
</app-form-field>
```

**Propriedades:**
- `label`: string
- `error`: string
- `hint`: string
- `required`: boolean
- `htmlFor`: string

---

## Design Tokens

Todas as variáveis de design estão centralizadas em `src/styles/design-tokens.css` e incluem:

- **Cores**: Primary, Secondary, Success, Warning, Danger, Info, Gray
- **Tipografia**: Tamanhos de fonte, pesos, espaçamentos de linha
- **Espaçamento**: Sistema de spacing de 4px
- **Border Radius**: Tamanhos pré-definidos
- **Sombras**: Níveis de elevação
- **Transições**: Durações padrão
- **Z-Index**: Camadas de profundidade

## Importação

Para importar os componentes:

```typescript
import { ButtonComponent } from '@/components/ui';
import { InputComponent } from '@/components/ui';
import { CardComponent } from '@/components/ui';
import { BadgeComponent } from '@/components/ui';
import { FormFieldComponent } from '@/components/ui';
```
