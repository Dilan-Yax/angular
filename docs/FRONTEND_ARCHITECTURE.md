# Frontend Architecture (Angular 18+)

## 1. Patrón Container / Presentational
La aplicación está diseñada usando una clara separación de responsabilidades en la UI:
- **Container Components (Smart)**: Se encargan de inyectar dependencias (servicios), manejar el estado (Signals), y comunicarse con el backend. Pasan los datos hacia abajo a los componentes presentacionales y reaccionan a los eventos que estos emiten. (Ej: `ProductosPageComponent`)
- **Presentational Components (Dumb)**: No tienen dependencias de servicios ni conocen de dónde vienen los datos. Reciben información estrictamente mediante `@Input()` y se comunican con sus ancestros vía `@Output()`. (Ej: `ListaProductosComponent`)

## 2. Feature-First Structure
Los archivos se agrupan por dominio/feature de negocio (`features/productos`, `features/auth`), y no por tipo técnico (todos los componentes juntos, todos los servicios juntos).
Estructura típica de un feature:
- `components/`: Componentes container y presentacionales.
- `services/`: Lógica de comunicación con APIs o estado complejo.
- `models/`: Interfaces y tipos TypeScript.

## 3. Estado con Signals
Para un manejo de estado reactivo y performante, se utilizan **Angular Signals**. Los Signals nos proveen control granular de reactividad y evitan dependencias complejas en RxJS (`BehaviorSubject`) para el estado UI simple a moderado:
- `signal()`: Para almacenar datos (como arrays de productos o estados de carga).
- Las suscripciones HTTP (`Observable`) se consumen y su resultado se vuelca en un Signal usando `.set()`.

## 4. Consumo de API
- **`environment.ts`**: Contiene la configuración global (`apiUrl`).
- **`auth.interceptor.ts`**: Interceptor funcional global (registrado en `app.config.ts` mediante `withInterceptors`) que inyecta automáticamente el token JWT local en el Header `Authorization` (Bearer) en toda petición saliente.
