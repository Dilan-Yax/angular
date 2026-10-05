import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';

export interface MenuItemSidebar {
  label: string;
  route: string;
  icono: string;
}

// ── Iconos SVG como constantes ──────────────────────────────────
const IC = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>`,
  productos: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  ventas: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>`,
  caja: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>`,
  clientes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
  reportes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  usuarios: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M23 11h-6"/><path d="M20 8v6"/></svg>`,
  auditoria: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">

      <!-- Brand -->
      <div class="sidebar__brand">
        <div class="sidebar__logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
        </div>
        <div>
          <p class="sidebar__brand-name">Pro POS</p>
          <p class="sidebar__brand-sub">Punto de Venta</p>
        </div>
      </div>

      <!-- User card -->
      <div class="sidebar__user">
        <div class="sidebar__avatar">{{ initial() }}</div>
        <div>
          <p class="sidebar__user-name">{{ usuario()?.userName }}</p>
          <span class="sidebar__badge">{{ usuario()?.role }}</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar__nav">
        <p class="sidebar__section-label">MENÚ PRINCIPAL</p>
        @for (item of menuItems(); track item.route) {
          <a class="sidebar__link"
             [routerLink]="item.route"
             routerLinkActive="sidebar__link--active"
             [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }">
            <span class="sidebar__icon" [innerHTML]="item.icono"></span>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <div class="sidebar__spacer"></div>

      <!-- Logout -->
      <div class="sidebar__footer">
        <button class="sidebar__logout" (click)="cerrarSesion()">
          <span class="sidebar__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      display: flex;
      flex-direction: column;
      width: 240px;
      min-height: 100vh;
      background: #0f172a;
      position: fixed;
      top: 0; left: 0;
      z-index: 100;
      padding: 1rem 0.75rem;
      border-right: 1px solid rgba(255,255,255,0.06);
    }
    .sidebar__brand {
      display: flex; align-items: center; gap: 0.6rem;
      padding: 0.25rem 0.5rem 1.25rem;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      margin-bottom: 1rem;
    }
    .sidebar__logo {
      display: flex; align-items: center; justify-content: center;
      width: 2.2rem; height: 2.2rem;
      background: #6366f1; border-radius: 0.6rem;
      color: white; flex-shrink: 0;
    }
    .sidebar__logo svg { width: 1.1rem; height: 1.1rem; }
    .sidebar__brand-name { margin: 0; font-size: 0.95rem; font-weight: 700; color: #f1f5f9; }
    .sidebar__brand-sub  { margin: 0; font-size: 0.65rem; color: #64748b; font-weight: 500; }

    .sidebar__user {
      display: flex; align-items: center; gap: 0.65rem;
      padding: 0.65rem 0.75rem;
      background: rgba(255,255,255,0.05);
      border-radius: 0.6rem; margin-bottom: 1.5rem;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .sidebar__avatar {
      display: flex; align-items: center; justify-content: center;
      width: 2rem; height: 2rem;
      background: #6366f1; border-radius: 50%;
      color: white; font-weight: 700; font-size: 0.85rem; flex-shrink: 0;
    }
    .sidebar__user-name { margin: 0 0 0.15rem; font-size: 0.82rem; font-weight: 600; color: #e2e8f0; }
    .sidebar__badge {
      display: inline-block; padding: 0.1rem 0.45rem;
      background: rgba(99,102,241,0.25); color: #818cf8;
      border-radius: 999px; font-size: 0.62rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.07em;
    }

    .sidebar__section-label {
      font-size: 0.6rem; font-weight: 700; letter-spacing: 0.12em;
      color: #475569; padding: 0 0.6rem; margin: 0 0 0.4rem;
    }
    .sidebar__link {
      display: flex; align-items: center; gap: 0.65rem;
      padding: 0.6rem 0.75rem; border-radius: 0.55rem;
      color: #94a3b8; text-decoration: none;
      font-size: 0.85rem; font-weight: 500;
      margin-bottom: 0.15rem; transition: all 0.15s ease; cursor: pointer;
    }
    .sidebar__link:hover { background: rgba(255,255,255,0.07); color: #e2e8f0; }
    .sidebar__link--active {
      background: rgba(99,102,241,0.18) !important;
      color: #818cf8 !important; font-weight: 600;
    }
    .sidebar__icon {
      display: flex; align-items: center; justify-content: center;
      width: 1.25rem; height: 1.25rem; flex-shrink: 0;
    }
    .sidebar__icon svg { width: 1.05rem; height: 1.05rem; }

    .sidebar__spacer { flex: 1; }

    .sidebar__footer {
      border-top: 1px solid rgba(255,255,255,0.06);
      padding-top: 0.75rem;
    }
    .sidebar__logout {
      display: flex; align-items: center; gap: 0.65rem;
      width: 100%; padding: 0.6rem 0.75rem;
      border-radius: 0.55rem; background: transparent;
      border: none; color: #64748b;
      font-size: 0.85rem; font-weight: 500;
      cursor: pointer; transition: all 0.15s ease;
    }
    .sidebar__logout:hover { background: rgba(239,68,68,0.12); color: #f87171; }
  `]
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly usuario = this.authService.usuarioActual;

  readonly initial = computed(() => {
    const name = this.usuario()?.userName;
    return name ? name[0].toUpperCase() : 'U';
  });

  /**
   * Calcula las opciones del menú. Usa un solo array y @for
   * en lugar de múltiples @if, evitando bugs de renderizado.
   */
  readonly menuItems = computed<MenuItemSidebar[]>(() => {
    const u = this.usuario();
    if (!u) return [];

    const esAdmin = u.role?.toUpperCase() === 'ADMIN';
    const permisos = u.permisos ?? [];

    const items: MenuItemSidebar[] = [
      { label: 'Dashboard',  route: '/dashboard',  icono: IC.dashboard },
    ];

    if (esAdmin || permisos.includes('productos.listar')) {
      items.push({ label: 'Productos', route: '/productos', icono: IC.productos });
    }
    if (esAdmin || permisos.includes('ventas.registrar')) {
      items.push({ label: 'Ventas', route: '/ventas', icono: IC.ventas });
    }
    // Sesiones y arqueo de caja
    items.push({ label: 'Caja', route: '/caja', icono: IC.caja });
    // Siempre visible para cualquier usuario autenticado
    items.push({ label: 'Clientes',  route: '/clientes',  icono: IC.clientes });
    items.push({ label: 'Reportes',  route: '/reportes',  icono: IC.reportes });

    if (esAdmin) {
      items.push({ label: 'Usuarios', route: '/usuarios', icono: IC.usuarios });
      items.push({ label: 'Auditoría', route: '/auditoria', icono: IC.auditoria });
    }

    return items;
  });

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
