import { Routes } from '@angular/router';
import { Login } from './features/auth/components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { authGuard } from './features/auth/guards/auth.guard';
import { adminGuard } from './features/auth/guards/admin.guard';
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
  {
    path: 'categorias',
    loadComponent: () =>
      import('./features/categorias/components/categorias-page/categorias-page.component').then(
        (m) => m.CategoriasPageComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'ventas',
    loadComponent: () =>
      import('./features/ventas/components/registro-ventas-page/registro-ventas-page.component').then(
        (m) => m.RegistroVentasPageComponent
      ),
    canActivate: [authGuard],
  },
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
  {
    path: 'reportes',
    loadComponent: () =>
      import('./features/reportes/components/reportes-page/reportes-page.component').then(
        (m) => m.ReportesPageComponent
      ),
    canActivate: [adminGuard],
  },
  {
    path: 'auditoria',
    loadComponent: () =>
      import('./features/auditoria/components/auditoria-page/auditoria-page.component').then(
        (m) => m.AuditoriaPageComponent
      ),
    canActivate: [adminGuard],
  },
  { path: '**', redirectTo: '' },
];
