# Biblioteca de Ícones - Lucide Angular

Este projeto usa [Lucide Angular](https://lucide.dev/guide/packages/lucide-angular) para ícones.

## Como usar

### 1. Importar o módulo e o ícone no componente TypeScript

```typescript
import { LucideAngularModule, LogOut, Home, User } from 'lucide-angular';

@Component({
  selector: 'app-example',
  imports: [LucideAngularModule],
  // ...
})
export class Example {
  // Expor os ícones como propriedades públicas readonly
  readonly LogOut = LogOut;
  readonly Home = Home;
  readonly User = User;
}
```

### 2. Usar no template HTML

```html
<!-- Ícone básico -->
<lucide-icon [img]="LogOut"></lucide-icon>

<!-- Ícone com tamanho customizado -->
<lucide-icon [img]="Home" [size]="24"></lucide-icon>

<!-- Ícone com cor customizada -->
<lucide-icon [img]="User" [size]="20" [color]="'#667eea'"></lucide-icon>

<!-- Ícone com classe CSS -->
<lucide-icon [img]="LogOut" class="icon-danger"></lucide-icon>
```

### 3. Estilizar com CSS

```css
.icon-danger {
  color: var(--color-danger-500);
}

.icon-large {
  width: 32px;
  height: 32px;
}
```

## Ícones disponíveis

Veja todos os ícones disponíveis em: https://lucide.dev/icons/

Exemplos de ícones comuns:
- **LogOut**: Sair/Logout
- **Home**: Página inicial
- **User**: Usuário
- **Users**: Usuários/Colaboradores
- **Settings**: Configurações
- **Menu**: Menu hamburguer
- **X**: Fechar
- **Plus**: Adicionar
- **Edit**: Editar
- **Trash**: Excluir
- **Search**: Buscar
- **ChevronLeft/Right/Up/Down**: Setas
- **Check**: Confirmar
- **AlertCircle**: Alerta
- **Info**: Informação

## Vantagens

✅ Ícones SVG otimizados
✅ Tree-shakeable (apenas ícones usados são incluídos no bundle)
✅ Tipagem TypeScript
✅ Biblioteca leve e moderna
✅ Fácil customização de tamanho e cor
