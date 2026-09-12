import { Routes } from '@angular/router';
import { ProductoLista } from './components/producto-lista/producto-lista';
import { ProductoDetalle } from './components/producto-detalle/producto-detalle';

export const routes: Routes = [
  { path: '', redirectTo: 'productos', pathMatch: 'full' },
  { path: 'productos', component: ProductoLista },
  { path: 'productos/:id', component: ProductoDetalle },
  { path: '**', redirectTo: 'productos' },
];