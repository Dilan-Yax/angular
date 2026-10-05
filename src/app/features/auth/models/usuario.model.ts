export interface LoginRequest {
  userName: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userName: string;
  role: string;
}

export interface UsuarioSesion {
  userName: string;
  role: string;
  permisos: string[];
}


