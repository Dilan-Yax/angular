# Contexto del Proyecto Frontend - Angular POS

Este archivo proporciona contexto y directivas para herramientas y asistentes de inteligencia artificial (Antigravity, OpenCode, Cursor, Copilot).

## 1. Información General del Proyecto
- **Nombre**: `pro-angular`
- **Framework**: Angular 22
- **Lenguaje**: TypeScript
- **Estilos y Componentes UI**: Bootstrap 5 (`bootstrap` y `@popperjs/core`)
- **Estilo global**: `src/styles.css` y `node_modules/bootstrap/dist/css/bootstrap.min.css`

## 2. Estructura de Directorios
```
pro-angular/
├── src/
│   ├── app/                # Componentes, servicios, módulos/rutas de la aplicación
│   ├── assets/             # Recursos estáticos
│   ├── main.ts             # Punto de entrada de la aplicación
│   └── styles.css          # Estilos globales personalizados
├── public/                 # Archivos públicos directos
├── angular.json            # Configuración de compilación, estilos y pruebas
├── package.json            # Dependencias y scripts de npm
└── tsconfig.json           # Configuración del compilador TypeScript
```

## 3. Comandos Principales
- **Iniciar servidor de desarrollo**: `npm start` o `ng serve`
- **Compilar aplicación para producción**: `npm run build` o `ng build`
- **Ejecutar pruebas unitarias**: `npm test` o `ng test`

## 4. Estrategia de Ramas (Git Flow)
- `main`: Rama de producción principal.
- `develop`: Rama base de desarrollo continuo.
- `stage`: Rama de pruebas y aseguramiento de calidad (QA).
- `feature-*` (ej. `feature-a`, `feature-auth`): Ramas para nuevas características o componentes.

## 5. Convenciones de Desarrollo
- Utilizar componentes Standalone cuando sea aplicable.
- Para maquetación visual y componentes responsivos, usar clases nativas de Bootstrap 5 (ej. `container`, `row`, `col`, `btn-primary`, `table`, `card`).
- Mantener tipado estricto en TypeScript sin uso innecesario de `any`.
