import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.estaAutenticado()) {
    return router.createUrlTree(['/login']);
  }

  const role = authService.usuarioActual()?.role?.toUpperCase();
  if (role === 'ADMIN') {
    return true;
  }

  // Si no tiene rol Admin, redirigir al Dashboard
  return router.createUrlTree(['/dashboard']);
};
