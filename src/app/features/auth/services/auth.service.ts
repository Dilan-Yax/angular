import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UsuarioSesion,
} from '../models/usuario.model';

const TOKEN_KEY = 'pro_token';
const USER_KEY = 'pro_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5261/api/auth';

  private readonly usuario = signal<UsuarioSesion | null>(this.leerUsuario());

  readonly usuarioActual = this.usuario.asReadonly();
  readonly estaAutenticado = computed(() => this.usuario() !== null);

  login(credenciales: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credenciales)
      .pipe(tap((respuesta) => this.guardarSesion(respuesta)));
  }

  registro(datos: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, datos)
      .pipe(tap((respuesta) => this.guardarSesion(respuesta)));
  }

  cerrarSesion(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.usuario.set(null);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private guardarSesion(respuesta: AuthResponse): void {
    const permisos = this.extraerPermisos(respuesta.token);
    
    const sesion: UsuarioSesion = {
      userName: respuesta.userName,
      role: respuesta.role,
      permisos: permisos,
    };

    localStorage.setItem(TOKEN_KEY, respuesta.token);
    localStorage.setItem(USER_KEY, JSON.stringify(sesion));
    this.usuario.set(sesion);
  }

  private leerUsuario(): UsuarioSesion | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as Partial<UsuarioSesion>;
      // Asegurar que permisos siempre sea un array
      if (!Array.isArray(parsed.permisos)) {
        parsed.permisos = this.extraerPermisos(localStorage.getItem(TOKEN_KEY) ?? '');
        // Persistir la sesión normalizada para futuros reloads
        localStorage.setItem(USER_KEY, JSON.stringify(parsed));
      }
      return {
        userName: parsed.userName ?? '',
        role: parsed.role ?? '',
        permisos: parsed.permisos,
      };
    } catch {
      return null;
    }
  }

  private extraerPermisos(token: string): string[] {
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadDecoded = atob(payloadBase64);
      const payload = JSON.parse(payloadDecoded);
      
      const permisos = payload.permission || payload.Permission || payload.permissions || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      
      if (Array.isArray(permisos)) {
        return permisos;
      }
      return permisos ? [permisos] : [];
    } catch {
      return [];
    }
  }
}
