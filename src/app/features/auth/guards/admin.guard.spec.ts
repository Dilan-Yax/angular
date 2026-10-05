import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';
import { signal } from '@angular/core';
import { UsuarioSesion } from '../models/usuario.model';

describe('adminGuard', () => {
  let mockAuthService: {
    estaAutenticado: () => boolean;
    usuarioActual: () => UsuarioSesion | null;
  };
  let mockRouter: {
    createUrlTree: (commands: any[]) => UrlTree;
  };

  beforeEach(() => {
    mockAuthService = {
      estaAutenticado: () => true,
      usuarioActual: () => ({ userName: 'admin', role: 'Admin', permisos: [] }),
    };

    mockRouter = {
      createUrlTree: (commands: any[]) => ({ toString: () => commands.join('/') } as UrlTree),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  it('permite el acceso si el usuario está autenticado y tiene rol Admin', () => {
    mockAuthService.estaAutenticado = () => true;
    mockAuthService.usuarioActual = () => ({ userName: 'admin', role: 'Admin', permisos: [] });

    const resultado = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(resultado).toBe(true);
  });

  it('redirige a /login si no está autenticado', () => {
    mockAuthService.estaAutenticado = () => false;
    mockAuthService.usuarioActual = () => null;

    const resultado = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect((resultado as UrlTree).toString()).toBe('/login');
  });

  it('redirige a /dashboard si está autenticado pero su rol no es Admin', () => {
    mockAuthService.estaAutenticado = () => true;
    mockAuthService.usuarioActual = () => ({ userName: 'cajero', role: 'Cajero', permisos: [] });

    const resultado = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect((resultado as UrlTree).toString()).toBe('/dashboard');
  });
});
