## 🔧 Comandos utilizados para crear el proyecto

### 1. Crear la aplicación Next.js
```bash
npx create-next-app@latest my-pomodoro-app --typescript --tailwind --eslint --app --src-dir

Crea una nueva app con Next.js usando la App Router.
Incluye TypeScript, Tailwind CSS, y ESLint.
Usa la estructura src/ para organizar mejor el código fuente.

### 2. Entrar en el directorio del proyecto
```bash
cd my-pomodoro-app

Cambia al directorio recién creado para seguir configurando el proyecto.

### 3. Instalar dependencias necesarias
```bash
npm install lucide-react class-variance-authority clsx tailwind-merge

Dependencias instaladas:
lucide-react: Iconos bonitos y accesibles para React.
class-variance-authority (cva): Define variantes de estilo (ej: botón primario/secundario).
clsx: Combina clases condicionalmente (ideal con Tailwind).
tailwind-merge: Fusiona clases de Tailwind sin conflictos.

### 4. Inicializar ShadCN
```bash
npx shadcn@latest init

Configura ShadCN en tu proyecto.

### 5. Añadir componentes de ShadCN
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add form
npx shadcn@latest add dialog
... y cualquier otro componente necesario