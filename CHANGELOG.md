# Frontend Changelog

Todas las modificaciones del cliente Angular se documentarán en este archivo.

## [2026-10-04] - Módulo Turnos de Caja (Sesiones, Arqueo y Cierre)
- **Tipo**: Nuevo
- **Archivos afectados**: `src/app/features/caja/*`, `src/app/app.routes.ts`, `src/app/shared/components/navbar/navbar.component.ts`, `angular.json`
- **Patrón / Principio aplicado**: Standalone Components, Angular 18 Signals (`signal`, `computed`), Lazy Loading (`loadComponent`), DTOs e Inyección de Dependencias.
- **Descripción**:
  - Implementación completa del módulo de turnos y arqueos de caja (`CajaPageComponent` standalone).
  - Modelos e interfaces: `CajaSesionDto`, `EstadoCajaResponseDto`, `AbrirCajaDto`, `CerrarCajaDto`, `CajaFiltroDto`, `EstadoCajaSesion`.
  - Servicio HTTP `CajaService` consumiendo endpoints `GET /api/cajas/estado-actual`, `POST /api/cajas/abrir`, `POST /api/cajas/{id}/cerrar` y `GET /api/cajas/historial`.
  - Interfaz de usuario intuitiva:
    * Estado sin caja activa: pantalla informativa con botón de inicio de turno.
    * Estado con turno abierto: banner dinámico con indicador de pulso, tarjetas de métricas en tiempo real (Fondo Inicial, Ventas en Efectivo, Otros Medios, Monto Total Esperado en Gaveta).
    * Modal de Apertura con validación de monto inicial no negativo.
    * Modal de Cierre y Arqueo con desglose teórico y cálculo en tiempo real de diferencia (`Cuadre Exacto`, `Sobrante` o `Faltante`).
  - Ruta protegida con lazy loading en `/caja` (`authGuard`).
  - Enlace con icono SVG de caja incorporado al Sidebar/Navbar principal.
  - Ajuste de budgets en `angular.json` (`anyComponentStyle`) para componentes con maquetación visual enriquecida.
- **Pruebas**: `npm run build` ejecutado exitosamente generando el chunk independiente `caja-page-component (30.17 kB)`.

## [2026-10-04] - Módulo Productos (Catálogo Autónomo con Signals y Paginación)
- **Tipo**: Refactor + Cambio
- **Archivos afectados**: `src/app/features/productos/components/productos-page/productos-page.component.ts`, `src/app/features/productos/models/producto.model.ts`, `src/app/features/productos/services/producto.service.ts`, `src/app/app.routes.ts`
- **Patrón / Principio aplicado**: Standalone Component autónomo, Angular Signals, CommonModule, FormsModule, `firstValueFrom` (RxJS), Lazy Loading.
- **Descripción**:
  - Reemplazo íntegro de `ProductosPageComponent` por una implementación autónoma y autosuficiente sin dependencias rotas de componentes huérfanos.
  - Gestión de estado reactivo mediante signals: `productos`, `totalItems`, `cargando`, `filtroNombre`, `paginaActual`, `pageSize` y `totalPaginas` (`computed`).
  - Tabla nativa completa con cabeceras (Código/SKU, Nombre, Precio, Stock, Estado, Acciones) y control de stock bajo dinámico.
  - Búsqueda por texto con recarga reactiva y control de estado de carga mediante spinner superpuesto y bloque `@empty`.
  - Interfaces `ProductoDto`, `ProductoFilterDto` y `PagedResultDto` actualizadas en `producto.model.ts`.
  - `ProductoService` adaptado para transferir parámetros de consulta hacia el backend.
  - Ruta `/productos` en `app.routes.ts` migrada a carga perezosa (`loadComponent`).
- **Pruebas**: `npm run build` exitoso generando el chunk `productos-page-component (14.81 kB)`.

## [2026-10-04] - Módulo Usuarios (frontend)
- **Tipo**: Nuevo
- **Archivos afectados**: `src/app/features/usuarios/*`, `src/app/app.routes.ts`, `src/app/shared/components/navbar/navbar.component.ts`
- **Patrón / Principio aplicado**: Container / Presentational, Angular Signals, Feature-First, Reactive Forms, CanDeactivate (dirty check)
- **Descripción**: Interfaz del módulo de Usuarios: listado paginado con filtros (texto, rol, estado, fechas), tabla con cabeceras ordenables, modal de detalle solo lectura, exportación CSV/Excel (blob + createObjectURL) con feedback de carga, paginador con selector de tamaño, y formulario crear/editar con dirty check y spinner anti doble envío. Ítem "Usuarios" en el sidebar solo para Admin.
- **Pruebas**: `npm run build` OK; `npm test` (Vitest) **2/2 superadas**.

## [2026-10-04] - Módulo Clientes (CRUD)
- **Tipo**: Nuevo
- **Archivos afectados**: `src/app/features/clientes/*`, `src/app/app.routes.ts`
- **Patrón / Principio aplicado**: Container / Presentational, Angular Signals, Feature-First, Reactive Forms
- **Descripción**: CRUD completo de clientes (listar, crear, actualizar, eliminar con soft delete). `ClientesPageComponent` (container con Signals) orquesta la lista y el formulario; `ListaClientesComponent` y `FormularioClienteComponent` son presentacionales puros. UI reutiliza las clases CSS del Dashboard (panel, seccion, tabla, estado) y el esquema de formulario del Login; la ruta `/clientes` ahora renderiza el módulo real.
- **Pruebas**: `npm run build` OK; `npm test` (Vitest) **2/2 superadas**.

## [2026-09-28] - Integración de Navegación Condicionada
- **Tipo**: Nuevo / Cambio
- **Archivos afectados**: `src/app/app.html`, `src/app/app.ts`, `src/app/app.routes.ts`, `src/app/services/auth.service.ts`, `src/app/models/usuario.model.ts`, `src/app/shared/components/navbar/navbar.component.ts`, `src/app/shared/components/placeholder/placeholder.component.ts`
- **Patrón / Principio aplicado**: Container / Presentational, Angular Signals, State Reuse
- **Descripción**: 
  - Se creó el `NavbarComponent` (Presentational) que recibe dinámicamente un arreglo de `MenuItem` (`@Input()`) y emite el evento de cierre de sesión (`@Output()`).
  - Se modificó `app.ts` (Container principal) para calcular reactivamente los ítems de navegación basándose en el rol y los permisos del usuario usando `computed()`.
  - Se actualizó `auth.service.ts` y su modelo (`UsuarioSesion`) para extraer y decodificar (`atob()`) los *claims* (`permisos` / `roles`) del JWT devuelto por el backend.
  - Se agregaron las rutas faltantes (`/productos`, `/ventas`, `/auditoria`) en `app.routes.ts`, apuntando a `ProductosPageComponent` y al nuevo componente genérico de espera `PlaceholderComponent`.
- **Pruebas**: Se validó exitosamente la construcción (`npm run build`) y que las reglas arquitectónicas (ausencia de librerías externas) se mantuvieran.

## [2026-09-28] - Estructura Base y Feature Productos
- **Tipo**: Nuevo / Configuración
- **Patrón aplicado**: Container / Presentational, Signals, Feature-First
- **Descripción**:
  - Se configuró el `environment.ts` con la URL base de la API backend.
  - Se creó un interceptor funcional HTTP (`auth.interceptor.ts`) para la inyección automática del token JWT tipo Bearer.
  - Se implementó la estructura `Feature-First` para el módulo "Productos".
  - Se diseñó el `ProductosPageComponent` (Container) delegando el control de estado reactivo mediante Angular Signals (`productos`, `loading`, `error`).
  - Se diseñó `ListaProductosComponent` (Presentational) que reacciona a través de `@Input()` y emite selecciones por `@Output()`.
  - Se documentó la arquitectura frontend en `docs/FRONTEND_ARCHITECTURE.md`.

