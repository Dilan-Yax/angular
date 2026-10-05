import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Aquí asumo que el token se guarda en localStorage con la clave 'token'
  // Si usas un servicio de autenticación, puedes inyectarlo: const authService = inject(AuthService);
  const token = localStorage.getItem('pro_token');

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
