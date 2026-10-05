# language: es
@login @frontend @angular
Funcionalidad: Inicio de sesión en la interfaz de usuario (Angular)

  Como usuario del sistema de punto de venta (POS)
  Quiero iniciar sesión a través del formulario de autenticación
  Para acceder a las funcionalidades protegidas de la aplicación

  Antecedentes:
    Dado que el usuario se encuentra en la ruta `/login` del módulo standalone `LoginComponent`
      Y el componente expone los controles mediante `ReactiveFormsModule` con `FormGroup` `loginForm`
      | Control      | FormControlName | Validadores                                      |
      | Correo       | correo          | required, email                                 |
      | Contraseña   | contrasena      | required, minLength(8)                          |
    Y el servicio `AuthService` expone los métodos
      | Método          | Firma                                   | Retorno        |
      | login           | login(correo, contrasena): Observable   | LoginResponse  |
      | guardarToken    | guardarToken(token): void              | void           |
      | obtenerToken    | obtenerToken(): string \| null          | string         |
      | cerrarSesion    | cerrarSesion(): void                    | void           |
      | estaAutenticado | estaAutenticado(): boolean              | boolean        |

  # ---------------------------------------------------------------------------
  # Escenario 1: Inicio de sesión exitoso
  # ---------------------------------------------------------------------------
  Escenario: Iniciar sesión con credenciales válidas redirige al dashboard

    Dado un formulario de login visible en `/login`
    Cuando el usuario llena el `loginForm` con
      | Campo       | FormControlName | Valor                |
      | Correo      | correo          | juan.perez@correo.com |
      | Contraseña  | contrasena      | password_123         |
    Y el usuario presiona el botón `Iniciar sesión` (`data-testid="btn-login"`)
    Entonces `AuthService.login` es invocado con las credenciales anteriores
      Y el formulario no es enviado dos veces (el botón se deshabilita mientras se procesa)
      Y la aplicación guarda el token mediante `AuthService.guardarToken(token)`
      Y el usuario es redirigido a la ruta `/productos`
      Y se muestra un mensaje de éxito (`data-testid="alert-success"`) con el texto "Inicio de sesión exitoso."

  # ---------------------------------------------------------------------------
  # Escenario 2: Contraseña incorrecta
  # ---------------------------------------------------------------------------
  Escenario: Mostrar error al enviar credenciales inválidas

    Dado un formulario de login visible en `/login`
    Cuando el `AuthService.login` responde con un error de código `401` (CREDENCIALES_INVALIDAS)
    Entonces se muestra una alerta de error (`data-testid="alert-error"`) con el mensaje del backend
      Y el campo `contrasena` se limpia
      Y el foco se mantiene en el campo `correo`
      Y el usuario permanece en la ruta `/login`

  # ---------------------------------------------------------------------------
  # Escenario 3: Validación de campos en el cliente
  # ---------------------------------------------------------------------------
  Escenario: Validar campos vacíos o con formato incorrecto antes de llamar al backend

    Dado un formulario de login visible en `/login`
    Cuando el usuario intenta enviar con
      | Campo       | FormControlName | Valor | Estado del control       |
      | Correo      | correo          | ""    | invalid (required)       |
      | Contraseña  | contrasena      | "123" | invalid (minLength(8))   |
    Entonces el formulario no es enviado (el botón queda deshabilitado)
      Y no se invoca el método `AuthService.login`
      Y se muestran mensajes de validación por campo
      | Campo       | Mensaje mostrado                            |
      | correo      | "El correo es obligatorio."                |
      | contrasena  | "La contraseña debe tener al menos 8 caracteres." |
    Y los controles con error reciben la clase CSS `is-invalid` de Bootstrap 5

  # ---------------------------------------------------------------------------
  # Escenario 4: Acceso a rutas protegidas sin sesión
  # ---------------------------------------------------------------------------
  Escenario: Redirigir a login cuando no hay token en la ruta protegida

    Dado que el usuario intenta navegar a `/productos` sin estar autenticado
      Y el guard `AuthGuard` ejecuta `AuthService.estaAutenticado()` y retorna `false`
    Entonces el usuario es redirigido a `/login`
      Y se registra una query parameter `redirectTo=/productos` para retornar tras autenticarse
      Y se muestra la notificación "Debe iniciar sesión para continuar."

  # ---------------------------------------------------------------------------
  # Escenario 5: Cerrar sesión
  # ---------------------------------------------------------------------------
  Escenario: Cerrar sesión limpia el token y redirige a login

    Dado un usuario autenticado en la ruta `/productos`
    Cuando el usuario presiona el botón `Cerrar sesión` (`data-testid="btn-logout"`)
    Entonces se invoca `AuthService.cerrarSesion()` que elimina el token de `localStorage`
      Y la aplicación redirige al usuario a `/login`
      Y no se puede acceder de nuevo a `/productos` sin re-autenticarse