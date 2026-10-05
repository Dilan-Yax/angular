# Frontend Architecture (Angular 18+)

## 1. Patrón Container / Presentational
La aplicación está diseñada usando una clara separación de responsabilidades en la UI:
- **Container Components (Smart)**: Se encargan de inyectar dependencias (servicios), manejar el estado (Signals), y comunicarse con el backend. Pasan los datos hacia abajo a los componentes presentacionales y reaccionan a los eventos que estos emiten. (Ej: `ProductosPageComponent`, `CategoriasPageComponent`, `RegistroVentasPageComponent`, `CajaPageComponent`)
- **Presentational Components (Dumb)**: No tienen dependencias de servicios ni conocen de dónde vienen los datos. Reciben información estrictamente mediante `@Input()` y se comunican con sus ancestros vía `@Output()`. (Ej: `TablaProductosComponent`, `FiltrosProductosComponent`, `FormularioProductoModalComponent`, `ListaCategoriasComponent`, `PaginadorComponent`)

## 2. Feature-First Structure
Los archivos se agrupan por dominio/feature de negocio (`features/productos`, `features/categorias`, `features/ventas`, `features/caja`, `features/usuarios`, `features/clientes`, `features/auth`), y no por tipo técnico.
Estructura típica de un feature:
- `components/`: Componentes container y presentacionales organizados por subcarpeta.
- `services/`: Lógica de comunicación con APIs o estado complejo (incluye archivo `.spec.ts` de pruebas unitarias).
- `models/`: Interfaces y tipos TypeScript alineados con los DTOs del backend.

## 3. Estado con Signals
Para un manejo de estado reactivo y performante, se utilizan **Angular Signals**. Los Signals nos proveen control granular de reactividad y evitan dependencias complejas en RxJS (`BehaviorSubject`) para el estado UI simple a moderado:
- `signal()`: Para almacenar datos (como arrays de productos o estados de carga).
- `computed()`: Para derivaciones reactivas automáticas (cálculos de totales, semáforos, paginación, filtros).
- Las suscripciones HTTP (`Observable`) se consumen y su resultado se vuelca en un Signal usando `.set()` o mediante promesas con `firstValueFrom()`.

## 4. Consumo de API
- **`environment.ts`**: Contiene la configuración global (`apiUrl`).
- **`auth.interceptor.ts`**: Interceptor funcional global (registrado en `app.config.ts` mediante `withInterceptors`) que inyecta automáticamente el token JWT local en el Header `Authorization` (Bearer) en toda petición saliente.

## 5. Módulo Terminal POS (Ventas)
El módulo de punto de venta (`features/ventas`) implementa la emisión de órdenes y cobro directo en mostrador:
- **Container (`RegistroVentasPageComponent`)**:
  - Inyecta `VentaService`, `ProductoService`, `CajaService` y `Router`.
  - Mantiene el estado en Signals: `carrito`, `productos`, `cajaActual`, `tieneCajaAbierta`, `cargandoProductos`, `procesandoVenta`, `alerta` y `ticketVenta`.
  - Calcula reactivamente mediante `computed()`: `totalVenta` (sumatoria de subtotales) y `totalArticulos` (conteo de unidades).
  - Gestiona la confirmación contra `POST api/ventas` procesando respuestas exitosas 201 Created y gestionando excepciones controladas como **HTTP 409 Conflict** (stock insuficiente o colisión de concurrencia en inventario) sin romper el flujo UI.
- **Presentacionales**:
  - `BusquedaProductosComponent`: Barra de búsqueda rápida de catálogo con badges de categoría y stock semaforizado (`stock--ok`, `stock--bajo`, `stock--agotado`).
  - `CarritoVentasComponent`: Lista de ítems en carrito, controles incrementales `+` / `-` validados contra existencias físicas, subtotales por producto y eliminación.
  - `ConfirmarVentaComponent`: Semáforo de turno de caja activo, calculadora rápida de efectivo y cambio a entregar en tiempo real, validación de fondo y botón de confirmación.

## 6. Módulo Gestión de Turnos de Caja
El módulo de arqueo y control de efectivo (`features/caja`) gestiona los turnos del personal cajero:
- **Container (`CajaPageComponent`)**:
  - Inyecta `CajaService`.
  - Gestiona Signals: `estadoCaja` (`EstadoCajaResponseDto`), `historial` (`CajaSesionDto[]`), `cargando`, `procesandoAccion`, `modalAperturaVisible` y `modalCierreVisible`.
  - Ejecuta las transacciones atómicas `abrirCaja(dto)` y `cerrarCaja(id, dto)`.
- **Presentacionales**:
  - `CajaEstadoComponent`: Panel principal con semáforo de estado (operativo/cerrado), badges de cajero responsable y 4 tarjetas KPI (Fondo Inicial, Ventas Efectivo, Ventas Tarjetas/Otros, Monto Esperado en Gaveta).
  - `CajaAperturaModalComponent`: Modal de captura de fondo inicial con atajos de efectivo (+Q50, +Q100, +Q200, +Q500) y notas.
  - `CajaCierreModalComponent`: Modal de arqueo con desglose contable, captura del conteo físico (`montoReal`) y cálculo en vivo de diferencia indicando sobrante o faltante.
  - `CajaHistorialComponent`: Tabla de turnos históricos con marcas de tiempo, montos, diferencias y estados.

## 7. Módulos CRUD de Productos y Categorías
Los módulos de inventario (`features/productos` y `features/categorias`) implementan el ciclo de vida completo de artículos y clasificaciones bajo arquitectura Feature-First:

### Categorías (`features/categorias`):
- **Container (`CategoriasPageComponent`)**:
  - Inyecta `CategoriaService`.
  - Maneja Signals: `categorias`, `cargando`, `guardando`, `modalCrearVisible`, `alerta`.
  - Orquesta la carga, creación (`crearCategoria`) y desactivación lógica (`desactivarCategoria`).
- **Presentacionales**:
  - `ListaCategoriasComponent`: Tabla con badges de estado activo/inactivo, conteo y botón de desactivación.
  - `FormularioCategoriaModalComponent`: Modal de creación de categoría con validación de campos obligatorios.

### Productos (`features/productos`):
- **Container (`ProductosPageComponent`)**:
  - Inyecta `ProductoService` y `CategoriaService`.
  - Maneja Signals: `productos`, `totalItems`, `totalPages`, `cargando`, `guardando`, `paginaActual`, `pageSize`, `filtrosActuales`, `categorias`, `modalVisible`, `productoSeleccionado`, `concurrenciaConflicto` y `alerta`.
  - Reutiliza el componente transversal `PaginadorComponent` (`src/app/features/usuarios/components/paginador`) para navegación de páginas y cambio dinámico de tamaño de página.
- **Presentacionales**:
  - `TablaProductosComponent`: Tabla de inventario con códigos SKU, nombre, descripción abreviada, categoría, precio, stock semaforizado (`stock--ok`, `stock--bajo`, `stock--agotado`), estado y botones de edición y desactivación.
  - `FiltrosProductosComponent`: Barra horizontal con input de búsqueda por texto, filtro reactivo por categoría, filtro por estado y switch de stock bajo.
  - `FormularioProductoModalComponent`: Modal para alta y modificación de artículos con soporte de OCC.

### Control de Concurrencia Optimista (OCC 409):
- El backend implementa concurrencia basada en tokens de versión en la entidad `Producto` (`uint Version` en MariaDB / EF Core).
- Al actualizar un producto (`PUT api/productos/{id}`), se envía la propiedad `version` que el cliente leyó.
- Si otro usuario o proceso modificó el registro previamente en la base de datos, el backend lanza `ConcurrencyConflictException`, retornando un código **HTTP 409 Conflict**.
- En el frontend:
  1. `ProductosPageComponent` captura el status `409` en el bloque `catch` y activa el signal `concurrenciaConflicto.set(true)`.
  2. `FormularioProductoModalComponent` muestra un banner de advertencia destacado:
     > **"El producto fue modificado por otro usuario"**  
     > *Los datos que estás viendo están desactualizados. Para proteger la integridad del catálogo, debes recargar los datos antes de volver a guardar.*
  3. Se bloquea el botón de envío y se despliega la acción **"Recargar Datos"**.
  4. Al pulsar el botón, el container invoca `productoService.getProducto(id)`, actualizando el signal `productoSeleccionado` con la versión más reciente del servidor y restableciendo `concurrenciaConflicto.set(false)`.
  5. El usuario puede aplicar sus modificaciones sobre el estado actualizado y guardar con éxito.

## 8. Módulo de Auditoría (Bitácora de Cambios)
El módulo de auditoría (`features/auditoria`) provee trazabilidad histórica de todas las mutaciones y eventos en el sistema consumiendo el endpoint `GET api/audit-log`:

- **Seguridad y Autorización (`adminGuard`)**:
  - Protegido en `app.routes.ts` mediante `canActivate: [adminGuard]`, garantizando que únicamente usuarios con rol `Admin` puedan ingresar a `/auditoria`, alineado estrictamente con `[JwtAuthGuard(Policy = Policies.Admin)]` en la API backend. Usuarios con otros roles son redirigidos a `/dashboard`.
- **Container (`AuditoriaPageComponent`)**:
  - Inyecta `AuditoriaService`.
  - Gestiona Signals: `logs`, `cargando`, `filtrosActuales`, `paginaActual`, `pageSize`, `logSeleccionado`, `modalDetalleVisible` y `alerta`.
  - Computa reactivamente `totalItems`, `totalPages`, `logsPaginados` y `entidadesDetectadas`.
  - Reutiliza el componente transversal `PaginadorComponent` (`src/app/features/usuarios/components/paginador/paginador.component`).
  - Provee un modal de comparación detallada con visualización formateada en JSON de valores previos (`ValoresAnteriores`) y valores nuevos (`ValoresNuevos`).
- **Presentacionales**:
  - `FiltrosAuditoriaComponent`: Barra de filtros con campos para búsqueda por usuario, entidad afectada (Producto, Categoria, Venta, CajaSesion, Usuario, Cliente) y rango de fechas (desde / hasta).
  - `TablaAuditoriaComponent`: Tabla de solo lectura con marcas de tiempo formateadas, badges semaforizados por operación (`Insert`, `Update`, `Delete`), badges de entidad e ID, previsualización de payload y disparador para inspección en modal.

## 9. Dashboard POS Reactivo con Servicios HTTP Reales
El `Dashboard` (`src/app/components/dashboard/dashboard.ts`) reemplazó la fuente de datos estática por el consumo de los servicios HTTP reales mediante Angular Signals:

- **Consumo de Servicios HTTP**:
  - `ProductoService` (`features/productos/services/producto.service`):
    - `getProductos({ pageSize: 100 })`: Consulta el catálogo para poblar la tabla principal de inventario y computar los KPIs generales.
    - `getProductos({ soloStockBajo: true, pageSize: 50 })`: Consume específicamente `GET api/productos?SoloStockBajo=true` para alimentar directamente el panel lateral **"Requieren reposición"** y mantener actualizada la alerta reactiva de existencias.
  - `CajaService` (`features/caja/services/caja.service`):
    - `getEstadoActual()`: Consume `GET api/cajas/estado-actual` para calcular el KPI de **Ventas Efectivo** del turno activo e indicar si la gaveta está en estado operativo o cerrada.
- **Métricas Reactivas y Cálculos Computados (`computed`)**:
  - `totalProductos`: Conteo de referencias registradas en el catálogo.
  - `disponibles`: Conteo de artículos con existencias (`stockActual > 0`).
  - `agotados`: Conteo de artículos sin existencias (`stockActual <= 0`).
  - `valorInventario`: Valorización monetaria total del inventario en tiempo real (`Σ precio * stockActual`).
  - `stockTotal`: Total de unidades físicas en inventario (`Σ stockActual`).
  - `alertaStock`: Colección reactiva de productos con stock agotado o inferior al umbral mínimo, proveniente de la consulta con `SoloStockBajo=true`.
  - `ventasEfectivoTurno`: Monto de ventas en efectivo acumuladas en la sesión de caja abierta.
- **Estética POS Preservada**:
  - Diseño responsivo en cuadrícula de 5 KPIs con clases semaforizadas (`.kpi__icono--azul`, `.kpi__icono--verde`, `.kpi__icono--rojo`, `.kpi__icono--morado`, `.kpi__icono--amber`).
  - Gráfica SVG de Donut para el balance de disponibles vs agotados.
  - Gráfica de barras de progreso con degradados por categoría.
  - Botón de refresco manual con spinner animado para actualización instantánea.

## 10. Módulo de Reportes Financieros (Ventas y Sesiones de Caja)
El módulo de reportes (`features/reportes`) provee herramientas de extracción y descarga de balances históricos en formatos estándar (`Excel .xlsx` y `CSV`) para auditoría y análisis de negocio:

- **Estructura Feature-First**:
  - `models/reporte.model.ts`: Tipos `TipoReporte` (`'ventas' | 'cajas'`), `FormatoReporte` (`'excel' | 'csv'`) y DTO `ParametrosReporteDto` (`formato`, `desde?`, `hasta?`).
  - `services/reporte.service.ts`: Métodos `descargarReporteVentas(params)` y `descargarReporteCajas(params)`.
  - `components/reportes-page/reportes-page.component.ts`: Container Smart Component autónomo.
- **Manejo de Descarga de Archivos Binarios (Blob)**:
  - Consumo HTTP con `responseType: 'blob'` y `observe: 'response'` para acceder a los encabezados HTTP del servidor.
  - Extracción robusta del nombre del archivo a partir de la cabecera `Content-Disposition` mediante expresiones regulares compatibles con RFC 5987 (`filename*=UTF-8''...`) y formato entrecomillado estándar (`filename="..."`).
  - Generación de URL transitoria en memoria mediante `URL.createObjectURL(blob)`.
  - Disparo de la descarga en el navegador instanciando un elemento dinámico `<a>`, asignando el `href` y `download`, ejecutando `link.click()`, y liberando inmediatamente la memoria mediante `URL.revokeObjectURL(url)` (replicando exactamente el estándar establecido en `usuarios.service.ts`).
- **Seguridad y Control de Acceso (`adminGuard`)**:
  - Protegido en `app.routes.ts` mediante `canActivate: [adminGuard]`, impidiendo el acceso a usuarios sin rol `Admin` y alineándose estrictamente con la política de autorización `Policies.Admin` de la API backend.
- **Experiencia de Usuario e Indicadores Reactivos**:
  - Signals para control granular de estado de carga: `cargandoVentas` y `cargandoCajas`, junto con los formatos seleccionados (`formatoActualVentas`, `formatoActualCajas`).
  - Spinners interactivos incrustados en los botones de exportación mientras el servidor compila y transmite el archivo.
  - Atajos rápidos de filtrado temporal ("Hoy", "Últimos 7 días", "Este mes", "Historial completo") y selectores manuales de fecha.
  - Banners de notificación contextuales con auto-limpieza ante descargas exitosas o mensajes de error HTTP (por ejemplo, advertencia explícita ante un eventual código 403 Forbidden).
