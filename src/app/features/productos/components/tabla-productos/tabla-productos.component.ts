import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoDto } from '../../models/producto.model';

@Component({
  selector: 'app-tabla-productos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-card">
      <div class="table-responsive">
        <table class="tabla align-middle">
          <thead>
            <tr>
              <th style="width: 120px;">Código/SKU</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th class="text-end" style="width: 120px;">Precio</th>
              <th class="text-center" style="width: 120px;">Stock</th>
              <th class="text-center" style="width: 110px;">Estado</th>
              <th class="text-center" style="width: 120px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @if (cargando) {
              <tr>
                <td colspan="7" class="text-center py-5">
                  <div class="spinner mx-auto mb-2"></div>
                  <span class="text-muted">Cargando inventario...</span>
                </td>
              </tr>
            } @else if (productos.length === 0) {
              <tr>
                <td colspan="7" class="text-center py-5">
                  <p class="text-muted mb-0">No se encontraron productos con los criterios seleccionados.</p>
                </td>
              </tr>
            } @else {
              @for (prod of productos; track prod.id) {
                <tr class="tabla-fila">
                  <td>
                    <span class="tabla__codigo">{{ prod.codigo || prod.sku || ('PRD-' + prod.id) }}</span>
                  </td>
                  <td>
                    <span class="tabla__nombre">{{ prod.nombre }}</span>
                    @if (prod.descripcion) {
                      <span class="tabla__descripcion">{{ prod.descripcion }}</span>
                    }
                  </td>
                  <td>
                    <span class="tabla__categoria">{{ prod.nombreCategoria || 'General' }}</span>
                  </td>
                  <td class="text-end">
                    <span class="tabla__precio">Q{{ prod.precio | number:'1.2-2' }}</span>
                  </td>
                  <td class="text-center">
                    <span class="tabla__stock" [ngClass]="obtenerClaseStock(prod)">
                      {{ obtenerStock(prod) }} uds.
                    </span>
                  </td>
                  <td class="text-center">
                    <span class="estado" [ngClass]="prod.isActive ? 'estado--ok' : 'estado--cerrado'">
                      {{ prod.isActive ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="text-center">
                    <div class="acciones-wrap">
                      <button
                        type="button"
                        class="btn-accion btn-accion--edit"
                        (click)="onEditar(prod.id)"
                        title="Editar producto"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      @if (prod.isActive) {
                        <button
                          type="button"
                          class="btn-accion btn-accion--delete"
                          (click)="onDesactivar(prod.id, prod.nombre)"
                          title="Desactivar producto"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .table-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 0.85rem;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
      overflow: hidden;
    }

    .tabla {
      width: 100%;
      margin-bottom: 0;
      border-collapse: collapse;
    }

    .tabla thead th {
      padding: 0.75rem 1rem;
      border-bottom: 2px solid #f1f5f9;
      color: #94a3b8;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      white-space: nowrap;
      background: #ffffff;
    }

    .tabla tbody td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid #f8fafc;
      font-size: 0.86rem;
    }

    .tabla tbody tr:last-child td {
      border-bottom: none;
    }

    .tabla-fila:hover {
      background-color: #fafbff;
    }

    .tabla__codigo {
      font-family: monospace;
      font-weight: 700;
      color: #6366f1;
      font-size: 0.8rem;
    }

    .tabla__nombre {
      display: block;
      font-weight: 700;
      color: #0f172a;
    }

    .tabla__descripcion {
      display: block;
      color: #94a3b8;
      font-size: 0.75rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 280px;
    }

    .tabla__categoria {
      display: inline-block;
      padding: 0.15rem 0.55rem;
      border-radius: 999px;
      background: rgba(99,102,241,0.08);
      color: #6366f1;
      font-size: 0.72rem;
      font-weight: 600;
    }

    .tabla__precio {
      font-weight: 800;
      color: #0f172a;
      font-size: 0.95rem;
    }

    .tabla__stock {
      display: inline-block;
      min-width: 2.2rem;
      padding: 0.15rem 0.5rem;
      border-radius: 0.4rem;
      font-size: 0.76rem;
      font-weight: 700;
      text-align: center;
    }

    .stock--ok {
      background: rgba(16,185,129,0.1);
      color: #10b981;
    }

    .stock--bajo {
      background: rgba(245,158,11,0.12);
      color: #d97706;
    }

    .stock--agotado {
      background: rgba(239,68,68,0.1);
      color: #ef4444;
    }

    .estado {
      display: inline-block;
      padding: 0.2rem 0.65rem;
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

    .acciones-wrap {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .btn-accion {
      width: 2rem;
      height: 2rem;
      border-radius: 0.45rem;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      color: #64748b;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-accion svg {
      width: 1rem;
      height: 1rem;
    }

    .btn-accion--edit:hover {
      border-color: #6366f1;
      color: #6366f1;
      background: rgba(99, 102, 241, 0.06);
    }

    .btn-accion--delete:hover {
      border-color: #ef4444;
      color: #ef4444;
      background: rgba(239, 68, 68, 0.06);
    }

    .spinner {
      width: 2rem;
      height: 2rem;
      border: 3px solid #e2e8f0;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class TablaProductosComponent {
  @Input() productos: ProductoDto[] = [];
  @Input() cargando: boolean = false;

  @Output() editar = new EventEmitter<number>();
  @Output() desactivar = new EventEmitter<number>();

  obtenerStock(prod: ProductoDto): number {
    return prod.stockActual ?? prod.stock ?? 0;
  }

  obtenerClaseStock(prod: ProductoDto): string {
    const stock = this.obtenerStock(prod);
    if (stock <= 0) return 'stock--agotado';
    if (prod.stockBajo || stock <= (prod.stockMinimo ?? 5)) return 'stock--bajo';
    return 'stock--ok';
  }

  onEditar(id: number): void {
    this.editar.emit(id);
  }

  onDesactivar(id: number, nombre: string): void {
    if (confirm(`¿Estás seguro de desactivar el producto "${nombre}"?`)) {
      this.desactivar.emit(id);
    }
  }
}
