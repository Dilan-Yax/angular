import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  template: `
    <div class="placeholder">
      <div class="placeholder__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <h2 class="placeholder__title">{{ titulo() }}</h2>
      <p class="placeholder__text">Este módulo se encuentra en desarrollo.<br>Estará disponible próximamente.</p>
    </div>
  `,
  styles: [`
    .placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      text-align: center;
    }
    .placeholder__icon {
      width: 4rem; height: 4rem;
      background: rgba(99,102,241,0.08);
      border-radius: 1rem;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 1.25rem;
      color: #6366f1;
    }
    .placeholder__icon svg { width: 2rem; height: 2rem; }
    .placeholder__title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.5rem;
    }
    .placeholder__text {
      color: #94a3b8;
      font-size: 0.88rem;
      line-height: 1.5;
      margin: 0;
    }
  `]
})
export class PlaceholderComponent {
  private readonly router = inject(Router);

  readonly titulo = computed(() => {
    const url = this.router.url;
    const map: Record<string, string> = {
      '/ventas': 'Ventas',
      '/clientes': 'Clientes',
      '/reportes': 'Reportes',
      '/auditoria': 'Auditoría',
    };
    return map[url] ?? 'Módulo';
  });
}
