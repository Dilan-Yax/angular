import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogFiltroDto } from '../../models/auditoria.model';

@Component({
  selector: 'app-filtros-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filtros-card mb-3">
      <div class="row g-2 align-items-center">
        <!-- Filtro por Usuario -->
        <div class="col-12 col-md-3">
          <label class="form-sublabel">Usuario</label>
          <div class="filtro-input-wrapper">
            <svg class="filtro-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <input
              type="text"
              class="filtro-input"
              placeholder="Buscar por usuario..."
              [(ngModel)]="usuario"
              (keyup.enter)="onFiltrar()"
            />
          </div>
        </div>

        <!-- Filtro por Entidad -->
        <div class="col-12 col-sm-6 col-md-3">
          <label class="form-sublabel">Entidad Afectada</label>
          <select class="filtro-select" [(ngModel)]="entidad" (ngModelChange)="onFiltrar()">
            <option value="">Todas las entidades</option>
            @for (ent of listaEntidades; track ent) {
              <option [value]="ent">{{ ent }}</option>
            }
          </select>
        </div>

        <!-- Fecha Desde -->
        <div class="col-6 col-sm-3 col-md-2">
          <label class="form-sublabel">Desde</label>
          <input
            type="date"
            class="filtro-input px-2"
            [(ngModel)]="desde"
            (ngModelChange)="onFiltrar()"
          />
        </div>

        <!-- Fecha Hasta -->
        <div class="col-6 col-sm-3 col-md-2">
          <label class="form-sublabel">Hasta</label>
          <input
            type="date"
            class="filtro-input px-2"
            [(ngModel)]="hasta"
            (ngModelChange)="onFiltrar()"
          />
        </div>

        <!-- Acciones -->
        <div class="col-12 col-md-2 d-flex align-items-end justify-content-end gap-2 pt-md-3">
          <button
            type="button"
            class="btn-filtrar"
            (click)="onFiltrar()"
            title="Aplicar filtros"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Filtrar</span>
          </button>

          <button
            type="button"
            class="btn-limpiar"
            (click)="onLimpiar()"
            title="Restablecer filtros"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filtros-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 0.85rem;
      padding: 1rem 1.25rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    .form-sublabel {
      display: block;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #64748b;
      margin-bottom: 0.25rem;
    }

    .filtro-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .filtro-icon {
      position: absolute;
      left: 0.75rem;
      width: 0.95rem;
      height: 0.95rem;
      color: #94a3b8;
      pointer-events: none;
    }

    .filtro-input, .filtro-select {
      width: 100%;
      height: 2.35rem;
      padding: 0 0.75rem 0 2.2rem;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 0.5rem;
      font-size: 0.82rem;
      color: #1e293b;
      transition: all 0.15s ease;
    }

    .filtro-select {
      padding-left: 0.75rem;
    }

    .px-2 {
      padding-left: 0.65rem !important;
      padding-right: 0.65rem !important;
    }

    .filtro-input:focus, .filtro-select:focus {
      outline: none;
      background: #ffffff;
      border-color: #6366f1;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
    }

    .btn-filtrar {
      background: #4f46e5;
      color: #ffffff;
      border: none;
      height: 2.35rem;
      padding: 0 0.9rem;
      border-radius: 0.5rem;
      font-size: 0.82rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .btn-filtrar svg {
      width: 0.9rem;
      height: 0.9rem;
    }

    .btn-filtrar:hover {
      background: #4338ca;
    }

    .btn-limpiar {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
      height: 2.35rem;
      padding: 0 0.85rem;
      border-radius: 0.5rem;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-limpiar:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
  `],
})
export class FiltrosAuditoriaComponent {
  @Input() entidadesDisponibles: string[] = [];
  @Output() filtrar = new EventEmitter<AuditLogFiltroDto>();
  @Output() limpiar = new EventEmitter<void>();

  usuario: string = '';
  entidad: string = '';
  desde: string = '';
  hasta: string = '';

  readonly entidadesBase: string[] = [
    'Producto',
    'Categoria',
    'Venta',
    'CajaSesion',
    'Usuario',
    'Cliente',
  ];

  get listaEntidades(): string[] {
    const set = new Set([...this.entidadesBase, ...this.entidadesDisponibles]);
    return Array.from(set).sort();
  }

  onFiltrar(): void {
    this.filtrar.emit({
      usuario: this.usuario.trim() || undefined,
      entidad: this.entidad.trim() || undefined,
      desde: this.desde || undefined,
      hasta: this.hasta || undefined,
    });
  }

  onLimpiar(): void {
    this.usuario = '';
    this.entidad = '';
    this.desde = '';
    this.hasta = '';
    this.limpiar.emit();
  }
}
