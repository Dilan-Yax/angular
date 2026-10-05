import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriaDto } from '../../models/categoria.model';

@Component({
  selector: 'app-lista-categorias',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="seccion">
      <div class="seccion__cabecera">
        <div>
          <h3 class="seccion__titulo">Listado de Categorías</h3>
          <span class="seccion__detalle">{{ categorias.length }} registradas en el catálogo</span>
        </div>
      </div>

      @if (cargando) {
        <div class="loading-wrap">
          <div class="spinner"></div>
          <p class="mb-0">Cargando categorías...</p>
        </div>
      } @else if (categorias.length === 0) {
        <p class="seccion__vacio text-center py-4">No se encontraron categorías registradas.</p>
      } @else {
        <div class="table-responsive">
          <table class="tabla align-middle">
            <thead>
              <tr>
                <th style="width: 70px;">ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th class="text-center" style="width: 110px;">Estado</th>
                <th class="text-center" style="width: 100px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (cat of categorias; track cat.id) {
                <tr>
                  <td>
                    <span class="tabla__codigo">#{{ cat.id }}</span>
                  </td>
                  <td>
                    <span class="tabla__nombre">{{ cat.nombre }}</span>
                  </td>
                  <td>
                    <span class="tabla__descripcion">{{ cat.descripcion || 'Sin descripción' }}</span>
                  </td>
                  <td class="text-center">
                    <span class="estado" [ngClass]="cat.isActive ? 'estado--ok' : 'estado--cerrado'">
                      {{ cat.isActive ? 'Activa' : 'Inactiva' }}
                    </span>
                  </td>
                  <td class="text-center">
                    @if (cat.isActive) {
                      <button
                        type="button"
                        class="btn-accion-danger"
                        (click)="onDesactivar(cat.id)"
                        title="Desactivar categoría"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .seccion {
      padding: 1.25rem 1.5rem 1.5rem;
      border-radius: 0.85rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    }

    .seccion__cabecera {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }

    .seccion__titulo {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
    }

    .seccion__detalle {
      color: #94a3b8;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .seccion__vacio {
      color: #94a3b8;
      font-size: 0.9rem;
    }

    .tabla {
      width: 100%;
      margin-bottom: 0;
      border-collapse: collapse;
    }

    .tabla thead th {
      padding: 0.6rem 0.75rem;
      border-bottom: 2px solid #f1f5f9;
      color: #94a3b8;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      white-space: nowrap;
    }

    .tabla tbody td {
      padding: 0.75rem 0.75rem;
      border-bottom: 1px solid #f8fafc;
      font-size: 0.86rem;
    }

    .tabla tbody tr:last-child td {
      border-bottom: none;
    }

    .tabla tbody tr:hover {
      background-color: #fafbff;
    }

    .tabla__codigo {
      font-family: monospace;
      font-weight: 700;
      color: #6366f1;
    }

    .tabla__nombre {
      font-weight: 700;
      color: #1e293b;
    }

    .tabla__descripcion {
      color: #64748b;
      font-size: 0.8rem;
    }

    .estado {
      display: inline-block;
      padding: 0.18rem 0.6rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
    }

    .estado--ok {
      background: rgba(16,185,129,0.1);
      color: #10b981;
    }

    .estado--cerrado {
      background: #f1f5f9;
      color: #64748b;
    }

    .btn-accion-danger {
      background: transparent;
      border: none;
      color: #94a3b8;
      padding: 0.3rem;
      border-radius: 0.4rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }

    .btn-accion-danger svg {
      width: 1.1rem;
      height: 1.1rem;
    }

    .btn-accion-danger:hover {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.08);
    }

    .loading-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 1rem;
      color: #64748b;
    }

    .spinner {
      width: 2rem;
      height: 2rem;
      border: 3px solid #e2e8f0;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 0.75rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ListaCategoriasComponent {
  @Input() categorias: CategoriaDto[] = [];
  @Input() cargando: boolean = false;

  @Output() desactivar = new EventEmitter<number>();

  onDesactivar(id: number): void {
    if (confirm('¿Estás seguro de desactivar esta categoría?')) {
      this.desactivar.emit(id);
    }
  }
}
