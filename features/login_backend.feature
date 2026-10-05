# language: es
@login @backend @api
Funcionalidad: Autenticación de usuario en el backend

  Como desarrollador de la API REST de autenticación
  Quiero validar las credenciales del usuario contra la base de datos
  Para emitir un token JWT seguro que permita el acceso a los recursos protegidos

  Antecedentes:
    Dado un usuario registrado en la tabla `Usuarios` con los siguientes datos
      | Campo          | Valor                   |
      | Id             | 1                       |
      | NombreCompleto | Juan Pérez              |
      | Correo         | juan.perez@correo.com   |
      | HashContrasena | $2a$11$... (Argon2/bcrypt) |
      | Rol            | "Administrador"         |
      | Activo         | true                    |
    Y una entidad `Usuario` mapeada mediante Entity Framework en el `DbContext` con las propiedades
      | Propiedad       | Tipo        | Anotación/Configuración                     |
      | Id              | int         | Clave primaria autogenerada                  |
      | NombreCompleto  | string      | Requerido, longitud máxima 120               |
      | Correo          | string      | Requerido, único, índice de correo           |
      | HashContrasena  | string      | Requerido, longitud fija 60 (bcrypt)         |
      | Rol             | string      | Requerido, por defecto "Usuario"             |
      | Activo          | bool        | Por defecto true                             |
      | FechaCreacion   | DateTime    | Por defecto UTC                             |

  # ---------------------------------------------------------------------------
  # Escenario 1: Credenciales válidas
  # ---------------------------------------------------------------------------
  Escenario: Iniciar sesión con credenciales válidas emite un token JWT

    Dado que el endpoint `POST /api/auth/login` recibe el cuerpo JSON `LoginRequest`
      Y el objeto `LoginRequestDto` con los campos
      | Campo       | Tipo   | Anotación      | Valor                 |
      | Correo      | string | Required       | juan.perez@correo.com |
      | Contrasena  | string | Required, min 8 | password_123         |
    Cuando el controlador `AuthController` invoca el método `Login(LoginRequestDto request)`
      Y se consulta el usuario mediante `context.Usuarios.SingleOrDefaultAsync(u => u.Correo == request.Correo)`
      Y se verifica que `u.Activo == true`
      Y se valida la contraseña con `PasswordHasher.Verify(request.Contrasena, u.HashContrasena)`
      Y se genera el JWT con el `TokenService` usando la clave secreta y tiempo de expiración configurados
    Entonces la respuesta HTTP tiene código `200 OK`
      Y el cuerpo `LoginResponseDto` contiene un token válido
      | Campo       | Tipo        | Contenido                                  |
      | Token       | string      | JWT firmado (HS256)                       |
      | ExpiraEn    | DateTime    | Fecha de expiración (ej. +15 min)        |
      | Usuario     | UsuarioDto  | Id, NombreCompleto, Correo, Rol           |

  # ---------------------------------------------------------------------------
  # Escenario 2: Credenciales inválidas
  # ---------------------------------------------------------------------------
  Escenario: Iniciar sesión con contraseña incorrecta devuelve 401

    Dado un usuario registrado con correo `juan.perez@correo.com`
      Y su `HashContrasena` no coincide con la contraseña enviada `password_incorrecta`
    Cuando el controlador recibe el `LoginRequestDto` con
      | Correo      | juan.perez@correo.com     |
      | Contrasena  | password_incorrecta       |
      Y el `PasswordHasher.Verify` retorna `false`
    Entonces la respuesta HTTP tiene código `401 Unauthorized`
      Y el cuerpo de error `ErrorResponseDto` contiene
      | Campo        | Valor                          |
      | Codigo       | "CREDENCIALES_INVALIDAS"       |
      | Mensaje      | "Correo o contraseña incorrectos." |
    Y el token de acceso no es generado

  # ---------------------------------------------------------------------------
  # Escenario 3: Usuario inexistente
  # ---------------------------------------------------------------------------
  Escenario: Iniciar sesión con correo no registrado devuelve 401

    Dado que no existe ningún usuario con el correo `anonimo@correo.com` en la tabla `Usuarios`
    Cuando el controlador recibe el `LoginRequestDto` con
      | Correo      | anonimo@correo.com     |
      | Contrasena  | cualquier_contrasena   |
      Y la consulta `SingleOrDefaultAsync` retorna `null`
    Entonces la respuesta HTTP tiene código `401 Unauthorized`
      Y el cuerpo de error `ErrorResponseDto` contiene
      | Campo        | Valor                          |
      | Codigo       | "CREDENCIALES_INVALIDAS"       |
      | Mensaje      | "Correo o contraseña incorrectos." |
    Y el token de acceso no es generado

  # ---------------------------------------------------------------------------
  # Escenario 4: Validación de datos de entrada
  # ---------------------------------------------------------------------------
  Escenario: Enviar campos vacíos o inválidos devuelve 400

    Cuando el controlador recibe un `LoginRequestDto` con datos que no pasan la validación
      | Campo       | Valor           | Regla incumplida                     |
      | Correo      | ""              | Required / formato de correo inválido |
      | Contrasena  | "123"           | Mínimo 8 caracteres                  |
    Entonces la respuesta HTTP tiene código `400 BadRequest`
      Y el cuerpo `ValidationProblemDetails` incluye los mensajes de error por campo
      | Campo       | Mensaje                           |
      | Correo      | "El correo es obligatorio."      |
      | Contrasena  | "La contraseña debe tener al menos 8 caracteres." |

  # ---------------------------------------------------------------------------
  # Escenario 5: Usuario desactivado
  # ---------------------------------------------------------------------------
  Escenario: Usuario inactivo no puede iniciar sesión

    Dado un usuario registrado con correo `suspendido@correo.com` y `Activo = false`
    Cuando el controlador recibe credenciales válidas para ese correo
    Entonces la respuesta HTTP tiene código `403 Forbidden`
      Y el cuerpo de error `ErrorResponseDto` contiene
      | Campo        | Valor                    |
      | Codigo       | "USUARIO_SUSPENDIDO"     |
      | Mensaje      | "La cuenta está suspendida." |
    Y el token de acceso no es generado