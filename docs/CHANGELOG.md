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

## [2026-10-04] - Módulo de Reportes Financieros (Ventas y Sesiones de Caja) con Descarga de Blobs, adminGuard y Signals
- **Tipo**: `Nuevo`
- **Archivos afectados**:
  - `src/app/features/reportes/models/reporte.model.ts` — tipos TypeScript `TipoReporte` (`'ventas' | 'cajas'`), `FormatoReporte` (`'excel' | 'csv'`) y `ParametrosReporteDto`.
  - `src/app/features/reportes/services/reporte.service.ts` — servicio HTTP con métodos `descargarReporteVentas` y `descargarReporteCajas`, configurados con `responseType: 'blob'`, lectura del header `Content-Disposition`, descarga por `URL.createObjectURL` y liberación de memoria por `URL.revokeObjectURL`.
  - `src/app/features/reportes/services/reporte.service.spec.ts` — suite de pruebas unitarias en Vitest validando llamadas HTTP con parámetros de fecha/formato y manejo de Blobs.
  - `src/app/features/reportes/components/reportes-page/reportes-page.component.ts` — container component con selectores de fechas manuales, atajos rápidos de rango temporal, tarjetas separadas para Ventas y Turnos de Caja, indicadores de carga (spinners) por operación y botón de descarga para Excel y CSV.
  - `src/app/features/reportes/components/reportes-page/reportes-page.component.spec.ts` — pruebas unitarias con Vitest validando atajos de fechas, ejecución de exportaciones y manejo de respuestas de éxito y errores HTTP (incluido 403 Forbidden).
  - `src/app/app.routes.ts` — configuración de la ruta `/reportes` con carga perezosa (`loadComponent`) protegida por `adminGuard`.
  - `docs/FRONTEND_ARCHITECTURE.md` — adición de la sección §10 describiendo la arquitectura, descarga de blobs y seguridad del módulo de reportes.
- **Patrón / Principio aplicado**: Feature-First, Angular 18 Signals (`signal`), Reactive Forms / NgModel, Manejo de Blobs y descarga en memoria con `URL.createObjectURL`, Control de Acceso por Roles (RBAC con `adminGuard`), Indicadores de carga asíncrona.
- **Descripción**: Se implementó el frontend del módulo de Reportes Financieros para Ventas y Turnos de Caja. Permite al usuario con rol Administrador filtrar por rangos de fecha predefinidos o personalizados y exportar los historiales en formato CSV o Microsoft Excel (.xlsx). El servicio replica exactamente el patrón de `usuarios.service.ts` para procesar la respuesta como Blob binario, extraer el nombre del archivo desde `Content-Disposition` y disparar la descarga en el navegador. La vista cuenta con spinners de carga interactivos y manejo de estados y alertas mediante Signals.
- **Pruebas**: 36/36 pruebas unitarias aprobadas en Vitest (`npm test -- --watch=false`). Compilación limpia de producción con `npm run build` (0 errores).

## [2026-10-04] - Conexión de Dashboard a Servicios HTTP Reales con Signals y Nuevo KPI de Caja
- **Tipo**: `Cambio` + `Refactor`
- **Archivos afectados**:
  - `src/app/components/dashboard/dashboard.ts` — inyección de `ProductoService` y `CajaService`, eliminación de dependencias de datos estáticos, declaración de Signals (`productos`, `productosReposicion`, `estadoCaja`, `cargando`), computados para inventario real (`totalProductos`, `disponibles`, `agotados`, `valorInventario`, `stockTotal`, `alertaStock`), computados para caja activa (`ventasEfectivoTurno`, `tieneCajaAbierta`), método `cargarDatos()` con `Promise.all` y formateador de moneda en Quetzales.
  - `src/app/components/dashboard/dashboard.html` — cuadrícula responsive ampliada a 5 KPIs (`row-cols-2 row-cols-sm-3 row-cols-xl-5`) con la nueva tarjeta de "Ventas Efectivo" (indicador de "Turno Activo" o "Caja Cerrada"), tabla de inventario enlazada a `p.stockActual` y `p.nombreCategoria`, panel lateral "Requieren reposición" alimentado exclusivamente por `GET api/productos?SoloStockBajo=true` y botón de actualización en tiempo real en la cabecera.
  - `src/app/components/dashboard/dashboard.css` — nuevos estilos estéticos para `.kpi__icono--amber`, `.kpi__valor--amber`, `.kpi__subetiqueta`, `.kpi__subetiqueta--activa` y `.btn-refrescar-dash` con soporte de animación de spinner.
  - `src/app/components/dashboard/dashboard.spec.ts` — pruebas unitarias completas con Vitest y mocks de servicios HTTP validando el cálculo reactivo de existencias, valor de inventario, filtrado de stock bajo y ventas del turno de caja.
  - `docs/FRONTEND_ARCHITECTURE.md` — adición de la sección §9 con la especificación de consumo de servicios HTTP y métricas del Dashboard.
- **Patrón / Principio aplicado**: Angular 18 Signals (`signal`, `computed`), Consumo asíncrono de API (`Promise.all` + `firstValueFrom`), Estética unificada orientada a POS (semáforos verde/amarillo/rojo, KPIs, degradados).
- **Descripción**: Se migró el `Dashboard` para utilizar los servicios HTTP de la aplicación (`ProductoService` y `CajaService`) en reemplazo de datos estáticos en memoria. Se configuró la llamada a `GET api/productos?SoloStockBajo=true` para alimentar directamente el panel de reposición de inventario y la alerta de stock, se recalcularon el valor total del inventario y las existencias físicas con los campos devueltos por el backend (`precio`, `stockActual`), y se incorporó un 5to KPI que muestra las ventas en efectivo del turno de caja activo consultando `GET api/cajas/estado-actual`.
- **Pruebas**: 27/27 pruebas unitarias aprobadas en Vitest (`npm test -- --watch=false`). Compilación limpia de producción con `npm run build` (0 errores).

## [2026-10-04] - Módulo de Auditoría (Bitácora de Cambios) con Container/Presentational, Signals y adminGuard
- **Tipo**: `Nuevo`
- **Archivos afectados**:
  - `src/app/features/auditoria/models/auditoria.model.ts` — interfaces TypeScript `AuditLogDto` (id, usuario, entidad, entidadId, operacion, valoresAnteriores, valoresNuevos, timestampUtc) y `AuditLogFiltroDto`.
  - `src/app/features/auditoria/services/auditoria.service.ts` — servicio HTTP consumiendo `GET api/audit-log` con mapeo de parámetros de consulta (`usuario`, `entidad`, `desde`, `hasta`).
  - `src/app/features/auditoria/services/auditoria.service.spec.ts` — suite de pruebas unitarias en Vitest con `provideHttpClientTesting` y `HttpTestingController` validando llamadas con y sin filtros.
  - `src/app/features/auditoria/components/filtros-auditoria/filtros-auditoria.component.ts` — componente presentacional con inputs de texto para usuario, selector de entidades (Producto, Venta, Categoria, CajaSesion, Usuario, Cliente), selector de rango de fechas (desde / hasta) y botones Filtrar / Limpiar.
  - `src/app/features/auditoria/components/tabla-auditoria/tabla-auditoria.component.ts` — tabla presentacional de solo lectura con marcas de tiempo formateadas, usuario responsable (o 'Sistema'), badges de entidad e ID, badges semaforizados por operación (`Insert`, `Update`, `Delete`), previsualización de cambios y acción para abrir modal diff.
  - `src/app/features/auditoria/components/auditoria-page/auditoria-page.component.ts` — container smart component con Signals (`logs`, `cargando`, `filtrosActuales`, `paginaActual`, `pageSize`, `logSeleccionado`, `modalDetalleVisible`, `alerta`), computados (`totalItems`, `totalPages`, `logsPaginados`, `entidadesDetectadas`), modal de comparación detallada en formato JSON (Valores Anteriores vs Valores Nuevos) y reutilización del componente transversal `PaginadorComponent`.
  - `src/app/features/auth/guards/admin.guard.ts` — functional route guard `adminGuard` que valida que el usuario esté autenticado y cuente estrictamente con el rol `Admin` (alineado con la policy `admin` y `Policies.Admin` en el backend). Si no tiene privilegios, redirige automáticamente a `/dashboard` o `/login`.
  - `src/app/features/auth/guards/admin.guard.spec.ts` — pruebas unitarias con `TestBed.runInInjectionContext` para `adminGuard` validando paso permitido a Administradores y redirecciones a usuarios no autorizados o no autenticados.
  - `src/app/app.routes.ts` — actualización de la ruta `/auditoria` con carga perezosa (`loadComponent`) apuntando a `AuditoriaPageComponent` protegida exclusivamente por `adminGuard`.
  - `docs/FRONTEND_ARCHITECTURE.md` — adición de la sección §8 documentando la arquitectura del módulo de Auditoría.
- **Patrón / Principio aplicado**: Container / Presentational, Angular 18 Signals, Feature-First Architecture, Control de Acceso Basado en Roles (RBAC con `adminGuard`), Reutilización transversal de `PaginadorComponent`.
- **Descripción**: Se implementó el módulo de Auditoría para permitir al Administrador inspeccionar la trazabilidad completa de cambios en la base de datos (bitácora de auditoría). La interfaz permite filtrar por usuario, entidad y rango de fechas, visualizar los registros paginados mediante el paginador reutilizable y abrir una vista detallada que compara los valores previos y los nuevos valores en formato JSON. La ruta está restringida estrictamente a usuarios administradores mediante `adminGuard`.
- **Pruebas**: 25/25 pruebas unitarias aprobadas en Vitest (`npm test -- --watch=false`). Compilación limpia de producción con `npm run build` (0 errores).

## [2026-10-04] - CRUD de Productos y Categorías con Control de Concurrencia Optimista (OCC)
- **Tipo**: `Nuevo` + `Refactor`
- **Archivos afectados**:
  - `src/app/features/productos/models/producto.model.ts` — DTOs e interfaces de dominio: `ProductoDto`, `ProductoDetalleDto` (incluyendo `version: number`), `CrearProductoDto`, `ActualizarProductoDto`, `ProductoFilterDto` y `PagedResultDto`.
  - `src/app/features/productos/services/producto.service.ts` — servicio HTTP CRUD completo (`getProductos`, `getProducto`, `crearProducto`, `actualizarProducto`, `desactivarProducto`) con serialización de parámetros de paginación y filtros.
  - `src/app/features/productos/services/producto.service.spec.ts` — pruebas unitarias completas en Vitest con `provideHttpClientTesting` y `HttpTestingController` validando operaciones CRUD y token de versión OCC.
  - `src/app/features/productos/components/tabla-productos/tabla-productos.component.ts` — presentacional de tabla de inventario con semáforos de stock (`stock--ok`, `stock--bajo`, `stock--agotado`), badges de estado y eventos `(editar)` / `(desactivar)`.
  - `src/app/features/productos/components/filtros-productos/filtros-productos.component.ts` — presentacional de filtros con búsqueda de texto, selector de categoría, selector de estado y switch de stock bajo.
  - `src/app/features/productos/components/formulario-producto-modal/formulario-producto-modal.component.ts` — modal presentacional para creación/edición con manejo de validaciones y banner de alerta para OCC 409 con botón "Recargar Datos".
  - `src/app/features/productos/components/productos-page/productos-page.component.ts` — container smart component orquestando Signals (`productos`, `totalItems`, `totalPages`, `filtrosActuales`, etc.), consumo de servicios, integración del `PaginadorComponent` transversal y gestión del conflicto de concurrencia 409 (`concurrenciaConflicto`).
  - `src/app/features/categorias/models/categoria.model.ts` — interfaces `CategoriaDto`, `CrearCategoriaDto` y `ActualizarCategoriaDto`.
  - `src/app/features/categorias/services/categoria.service.ts` — servicio HTTP para categorías (`getCategorias`, `getCategoria`, `crearCategoria`, `desactivarCategoria`).
  - `src/app/features/categorias/services/categoria.service.spec.ts` — pruebas unitarias completas de `CategoriaService`.
  - `src/app/features/categorias/components/lista-categorias/lista-categorias.component.ts` — presentacional de tabla de categorías con badges de estado y acciones.
  - `src/app/features/categorias/components/formulario-categoria-modal/formulario-categoria-modal.component.ts` — presentacional modal para alta de categoría.
  - `src/app/features/categorias/components/categorias-page/categorias-page.component.ts` — container component para categorías con Signals.
  - `src/app/app.routes.ts` — registro de la ruta perezosa `/categorias` con `canActivate: [authGuard]`.
  - `src/app/shared/components/navbar/navbar.component.ts` — incorporación del ítem "Categorías" con icono SVG en el menú lateral.
  - `docs/FRONTEND_ARCHITECTURE.md` — documentación arquitectónica del CRUD y del flujo de OCC 409.
- **Patrón / Principio aplicado**: Container / Presentational, Angular 18 Signals, Feature-First Architecture, Optimistic Concurrency Control (OCC), Reutilización de componentes transversales (`PaginadorComponent`).
- **Descripción**: Se implementó el módulo CRUD para Productos y Categorías. Se diseñaron componentes presentacionales reutilizables y desacoplados junto a contenedores inteligentes que gestionan el estado mediante Signals. Para el control de concurrencia optimista, al actualizar un producto el frontend envía la versión previa; ante un conflicto HTTP 409 devuelto por la API, se muestra un mensaje informativo amigable ("El producto fue modificado por otro usuario") con la opción directa de recargar los datos del servidor manteniendo la integridad del inventario.
- **Pruebas**: 19/19 pruebas unitarias aprobadas en Vitest (`npm test -- --watch=false`). Compilación limpia sin errores con `npm run build`.

## [2026-10-04] - Módulos de Ventas (Terminal POS) y Gestión de Caja (Apertura y Arqueo)
- **Tipo**: `Nuevo` + `Refactor`
- **Archivos afectados**:
  - `src/app/features/ventas/models/venta.model.ts` — interfaces TypeScript: `ItemCarrito`, `ItemVentaRequest`, `RegistrarVentaRequest`, `VentaDto` y `VentaDetalleDto`.
  - `src/app/features/ventas/services/venta.service.ts` — servicio HTTP consumiendo `POST api/ventas`, `GET api/ventas` y `GET api/ventas/{id}`.
  - `src/app/features/ventas/services/venta.service.spec.ts` — pruebas unitarias con `provideHttpClientTesting` y `HttpTestingController`.
  - `src/app/features/ventas/components/busqueda-productos/busqueda-productos.component.ts` — presentacional con barra de búsqueda rápida, badges de categorías, semáforos de stock (`stock--ok`, `stock--bajo`, `stock--agotado`) y botón para agregar al carrito.
  - `src/app/features/ventas/components/carrito-ventas/carrito-ventas.component.ts` — presentacional de carrito reactivo con cálculo de subtotales, controles incrementales/decrementales validados contra existencias físicas, vaciado y eliminación de ítems.
  - `src/app/features/ventas/components/confirmar-venta/confirmar-venta.component.ts` — presentacional de cobro con semáforo de estado de caja, calculadora de efectivo recibido y vuelto en tiempo real, atajos de billetes y validación de cobro.
  - `src/app/features/ventas/components/registro-ventas-page/registro-ventas-page.component.ts` — container smart component con Signals (`carrito`, `productos`, `cajaActual`, `tieneCajaAbierta`, etc.), computados (`totalVenta`, `totalArticulos`), emisión a `POST api/ventas` y manejo robusto de excepciones **HTTP 409 Conflict** (ProblemDetails por stock insuficiente) y 400.
  - `src/app/features/caja/components/caja-estado/caja-estado.component.ts` — presentacional para visualización de estado de caja activa, cajero responsable y 4 tarjetas KPI (Fondo Inicial, Ventas Efectivo, Ventas Otros Medios y Esperado en Gaveta).
  - `src/app/features/caja/components/caja-apertura-modal/caja-apertura-modal.component.ts` — modal presentacional para apertura de turno con fondo inicial, atajos de billetes y notas.
  - `src/app/features/caja/components/caja-cierre-modal/caja-cierre-modal.component.ts` — modal presentacional para arqueo y cierre con desglose contable, conteo de efectivo real y cálculo reactivo de diferencias (cuadre, sobrante o faltante).
  - `src/app/features/caja/components/caja-historial/caja-historial.component.ts` — tabla presentacional para historial de turnos con formato de moneda, fechas y badges de estado.
  - `src/app/features/caja/components/caja-page/caja-page.component.ts` — container component refactorizado que desacopla la UI en presentacionales y administra las llamadas a `CajaService` vía Signals.
  - `src/app/features/caja/services/caja.service.spec.ts` — pruebas unitarias de `CajaService` para estado actual, apertura, cierre e historial.
  - `src/app/app.routes.ts` — actualización de la ruta `/ventas` con carga perezosa (`loadComponent`) apuntando a `RegistroVentasPageComponent` con `authGuard`.
  - `docs/FRONTEND_ARCHITECTURE.md` — documentación detallada de la arquitectura de ambos módulos (§5 y §6).
- **Patrón / Principio aplicado**: Container / Presentational, Angular 18+ Signals (`signal`, `computed`), Feature-First Architecture, Estética unificada con Dashboard (KPIs, semáforos de estado, paneles, paleta slate/indigo/emerald/rose), Manejo resiliente de errores HTTP (409 Conflict).
- **Descripción**: Se implementaron por completo la terminal de ventas POS y la gestión de caja para cajeros y supervisores. En Ventas, la interfaz permite buscar productos, gestionar el carrito con cálculo automático de subtotales y validar el inventario en tiempo real, bloqueando cobros si no existe un turno de caja activo o si el stock es insuficiente (notificando el detalle de la excepción 409 Conflict devuelta por la API). En Caja, se estructuraron los componentes presentacionales para visualizar el turno activo con tarjetas KPI idénticas a las del Dashboard, abrir el turno con monto inicial y cerrarlo realizando el arqueo físico con cálculo instantáneo de sobrante o faltante.
- **Pruebas**: Compilación limpia de producción con `npm run build` (0 errores) y suite unitaria en Vitest: **8/8 pruebas aprobadas (100%)**.

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