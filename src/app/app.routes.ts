import { Routes } from '@angular/router';
import { Login } from './features/auth/components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { authGuard } from './features/auth/guards/auth.guard';
import { ClientesPageComponent } from './features/clientes/components/clientes-page/clientes-page.component';
import {
  UsuariosPageComponent,
  salirConFormularioLimpio,
} from './features/usuarios/components/usuarios-page/usuarios-page.component';
import { PlaceholderComponent } from './shared/components/placeholder/placeholder.component';

export const routes: Routes = [
  { path: '', component: Login, pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  {
    path: 'productos',
    loadComponent: () =>
      import('./features/productos/components/productos-page/productos-page.component').then(
        (m) => m.ProductosPageComponent
      ),
    canActivate: [authGuard],
  },
  { path: 'ventas', component: PlaceholderComponent, canActivate: [authGuard] },
  {
    path: 'caja',
    loadComponent: () =>
      import('./features/caja/components/caja-page/caja-page.component').then(
        (m) => m.CajaPageComponent
      ),
    canActivate: [authGuard],
  },
  { path: 'clientes', component: ClientesPageComponent, canActivate: [authGuard] },
  {
    path: 'usuarios',
    component: UsuariosPageComponent,
    canActivate: [authGuard],
    canDeactivate: [salirConFormularioLimpio],
  },
  { path: 'reportes', component: PlaceholderComponent, canActivate: [authGuard] },
  { path: 'auditoria', component: PlaceholderComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
