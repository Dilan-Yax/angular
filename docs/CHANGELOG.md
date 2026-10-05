# Bitácora de Desarrollo (CHANGELOG)

Este archivo registra **todos** los cambios realizados al proyecto. Cada cambio debe documentarse aquí antes de finalizar la tarea.

## Convención de formato
Cada entrada usa el siguiente formato (fecha en formato `YYYY-MM-DD`):

```md
## [YYYY-MM-DD] - Nombre del componente / funcionalidad
- **Tipo**: `Nuevo` | `Cambio` | `Corrección` | `Refactor` | `Documentación` | `Estilo`
- **Archivos afectados**: ruta(s) de archivos modificados
- **Descripción**: qué se hizo y por qué
- **Pruebas**: qué pruebas unitarias se añadieron/actualizaron y resultado
```

## Regla obligatoria
- Agregar una entrada en este archivo **por cada cambio** al proyecto.
- Referenciar los archivos afectados y las pruebas asociadas.
- Mantener orden cronológico (más reciente al inicio).

---

# Registro de cambios

## [2026-10-04] - Módulo Usuarios (frontend) — consulta, filtros, detalle, exportación y formulario
- **Tipo**: Nuevo
- **Archivos afectados**:
  - `src/app/features/usuarios/models/usuario.model.ts` — interfaces `UsuarioDto`, `UsuarioDetalleDto`, `PagedResultDto<T>`, `UsuarioFilterDto`, `CrearUsuarioRequest`, `CampoOrden` y constante `ROLES`.
  - `src/app/features/usuarios/services/usuarios.service.ts` — `obtenerPaginado(filtros)`, `obtenerDetalle(id)`, `descargarReporte(filtros, formato)` (blob + `URL.createObjectURL`, nombre desde Content-Disposition), `crearUsuario`, `actualizarUsuario`, `desactivarUsuario`; construcción de query params omitiendo vacíos.
  - `src/app/features/usuarios/components/usuarios-page/*` — container `UsuariosPageComponent` con Signals (`usuarios`, `totalItems`, `totalPages`, `cargando`, `error`, `filtros`, `exportando`, `mostrarDetalle`, `mostrarFormulario`, `guardando`, `formularioDirty`, `desactivandoId`) + guard `salirConFormularioLimpio` (`CanDeactivateFn`).
  - `src/app/features/usuarios/components/filtros-usuarios/*` — presentacional: barra de filtros (búsqueda, rol, estado, rango de fechas, limpiar).
  - `src/app/features/usuarios/components/tabla-usuarios/*` — presentacional: tabla con cabeceras ordenables (`CampoOrden`, aria-sort), badges de estado, acciones Ver/Editar/Desactivar.
  - `src/app/features/usuarios/components/detalle-usuario/*` — presentacional: modal de detalle solo lectura (role=dialog, aria-modal, cierre por fondo/Esc).
  - `src/app/features/usuarios/components/paginador/*` — presentacional: Anterior/Siguiente, rango de registros y selector de tamaño (5, 10, 20, 50).
  - `src/app/features/usuarios/components/formulario-usuario/*` — presentacional: formulario crear/editar con Reactive Forms, dirty check (confirm al cancelar) y spinner en guardado.
  - `src/app/app.routes.ts` — ruta `/usuarios` con `canActivate: [authGuard]` y `canDeactivate: [salirConFormularioLimpio]`.
  - `src/app/shared/components/navbar/navbar.component.ts` — ítem "Usuarios" (solo rol Admin) con ícono SVG propio.
- **Patrón / Principio aplicado**: Container / Presentational, Angular Signals, Feature-First, Reactive Forms, guard `CanDeactivate` para detección de cambios sin guardar, reutilización de la plantilla visual del Dashboard/Login (sin dependencias visuales nuevas), accesibilidad (aria-sort, role=dialog, aria-modal, etiquetas).
- **Descripción**: Interfaz completa del módulo de Usuarios consumiendo los endpoints del backend: listado paginado con filtros (texto, rol, estado, rango de fechas), ordenamiento por columnas, modal de detalle solo lectura, exportación CSV/Excel con feedback de carga y descarga vía blob, y formulario de creación/edición con dirty check (previene salidas accidentales confirmando antes de descartar) y bloqueo de doble envío con spinner. La navegación del sidebar muestra "Usuarios" únicamente al rol Admin (el backend además aplica la policy `admin`). Roles del dropdown: `Admin` y `Cajero` (seed `pos_inventario`). Nota: los botones Crear/Editar/Desactivar quedan cableados a `POST/PUT/DELETE api/usuarios`, endpoints que el backend aún no expone (solo existen `GET` listar/detalle/reporte), por lo que mostrarán error hasta implementarlos.
- **Pruebas**: Compilación de producción OK (`npm run build`). Suite `npm test` (Vitest): **2/2 superadas**.

## [2026-10-04] - Módulo Clientes (CRUD) — frontend
- **Tipo**: Nuevo
- **Archivos afectados**:
  - `src/app/features/clientes/models/cliente.model.ts` — interfaces `Cliente` y `CrearClienteRequest` (alineadas al DTO del backend).
  - `src/app/features/clientes/services/cliente.service.ts` — HTTP CRUD (`getClientes`, `getCliente`, `crearCliente`, `actualizarCliente`, `eliminarCliente`) contra `environment.apiUrl + '/clientes'`.
  - `src/app/features/clientes/components/clientes-page/*` — container `ClientesPageComponent` con Signals (`clientes`, `loading`, `error`, `guardando`, `errorForm`, `mostrarFormulario`, `clienteEnEdicion`) y CRUD completo.
  - `src/app/features/clientes/components/lista-clientes/*` — presentacional `ListaClientesComponent` (tabla con `@Input()`/`@Output()`).
  - `src/app/features/clientes/components/formulario-cliente/*` — presentacional `FormularioClienteComponent` (ReactiveFormsModule, `@Input()`/`@Output()`).
  - `src/app/app.routes.ts` — ruta `/clientes` apunta a `ClientesPageComponent` (antes `PlaceholderComponent`).
- **Patrón / Principio aplicado**: Container / Presentational, Angular Signals, Feature-First, Reactive Forms, reutilización de plantilla visual del Dashboard/Login (sin dependencias visuales nuevas).
- **Descripción**: Se implementó el CRUD de Clientes en el frontend siguiendo el patrón Container/Presentational con Signals. El container gestiona el estado (lista, carga, errores, formulario) y los presentacionales reciben/emiten datos sin conocer servicios. La UI reutiliza exactamente las clases CSS del Dashboard (`panel`, `seccion`, `tabla`, `estado`, `seccion__vacio`, etc.) y el esquema de formulario del Login, replicadas en los estilos del feature; maquetación con Bootstrap 5 (`row g-3`, `col-*`, `table-responsive`, `text-end`). La entrada de navegación "Clientes" del sidebar ya existía.
- **Pruebas**: Compilación de producción OK (`npm run build`). Suite `npm test` (Vitest): **2/2 superadas**.

## [2026-09-27] - Dashboard rediseñado con tema de punto de venta
- **Tipo**: Cambio + Estilo
- **Archivos afectados**: `src/app/components/dashboard/dashboard.ts`, `dashboard.html`, `dashboard.css`
- **Descripción**: Rediseño estético del dashboard orientado a POS: panel de bienvenida con degradado (usuario, rol y fecha en español), 4 tarjetas KPI con iconos SVG (Productos, Disponibles, Agotados, Valor del inventario), tabla de inventario con categorías, precios, stock con semáforo (verde/amarillo/rojo) y badges de estado, y panel lateral "Requieren reposición" con productos agotados o con stock bajo (≤ 5 unidades). Nuevos computados: `valorInventario`, `stockTotal`, `alertaStock`.
- **Pruebas**: Suite `npm test` (Vitest): **2/2 superadas**. Compilación de producción OK (`npm run build`).

## [2026-09-26] - Login como página inicial, rediseño moderno y eliminación del catálogo
- **Tipo**: Cambio + Corrección + Estilo
- **Archivos afectados**:
  - src/app/app.routes.ts — ruta raíz / ahora renderiza Login; eliminadas las rutas productos y productos/:id
  - src/app/app.ts, src/app/app.html, src/app/app.css — navbar y footer ocultos en la ruta de login; eliminado el link de Productos; cerrarSesion redirige a /login
  - src/app/components/login/login.ts, login.html, login.css — rediseño profesional y moderno: fondo oscuro con brillos degradados, tarjeta glassmorphism, iconos SVG, toggle de visibilidad de contraseña, estados de validación, spinner y animaciones
  - src/app/components/dashboard/dashboard.ts, dashboard.html — eliminado el botón roto "Ir al catálogo"; texto de tarjeta actualizado
  - src/app/app.spec.ts — actualizado a la nueva ruta inicial
  - Eliminados: src/app/components/producto-lista/, src/app/components/producto-detalle/
- **Descripción**: El login ahora es la primera página al entrar (la raíz / renderiza Login). Se eliminó el catálogo (lista y detalle de productos) por no ser necesario, conservando ProductoService como fuente de datos de las estadísticas del dashboard. Se corrigió el dashboard quitando el botón que navegaba a una ruta inexistente.
- **Pruebas**: `src/app/app.spec.ts` actualizado (2 tests). Resultado: **2/2 superadas** (`npm test`, Vitest). Compilación de producción OK (`npm run build`).

## [2026-09-26] - Script de inicio rápido (iniciar-todo.bat)
- **Tipo**: Nuevo
- **Archivos afectados**: `../iniciar-todo.bat` (raíz del proyecto)
- **Descripción**: Script .bat que abre el backend (`pro-api`, `dotnet run`) y el frontend (`pro-angular`, `npm start`) en consolas separadas para comprobar el sistema completo con un doble clic.
- **Pruebas**: Sin cambios funcionales; no requiere pruebas nuevas.

## [2026-09-26] - Backend .NET (pro-api) — inicialización
- **Tipo**: Documentación
- **Archivos afectados**: `../pro-api/docs/ARCHITECTURE.md`, `../pro-api/docs/CHANGELOG.md` (nueva carpeta hermana `pro-api`)
- **Descripción**: Se creó la carpeta hermana `pro-api` para el backend .NET del proyecto, con documentación de arquitectura Clean Architecture y bitácora propia. El frontend Angular consume este API vía `src/app/services/producto.service.ts`.
- **Pruebas**: Sin cambios funcionales en el frontend; no requiere pruebas nuevas.

## [2026-09-12] - Estructura escalable y reglas de desarrollo
- **Tipo**: Documentación
- **Archivos afectados**: `AGENTS.md`, `docs/CHANGELOG.md`, estructura de carpetas en `src/app/`
- **Descripción**: Se amplió la estructura de carpetas para escalabilidad y se documentaron reglas de pruebas unitarias, buenas prácticas y documentación de cambios.
- **Pruebas**: Sin cambios funcionales; no requiere pruebas nuevas.