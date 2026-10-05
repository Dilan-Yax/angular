import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoDto } from '../../../productos/models/producto.model';

@Component({
  selector: 'app-busqueda-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pos-card busqueda-panel">
      <!-- Barra de búsqueda superior -->
      <div class="busqueda-header">
        <div class="busqueda-input-wrapper">
          <svg class="busqueda-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            class="busqueda-input"
            placeholder="Buscar producto por nombre o código..."
            [ngModel]="filtroTexto"
            (ngModelChange)="onFiltroChange($event)"
            (keyup.enter)="ejecutarBusqueda()"
          />
          @if (filtroTexto) {
            <button type="button" class="btn-limpiar" (click)="limpiarFiltro()" title="Limpiar búsqueda">
              &times;
            </button>
          }
        </div>
        <button type="button" class="btn-buscar" (click)="ejecutarBusqueda()" [disabled]="cargando">
          @if (cargando) {
            <span class="spinner-sm"></span>
          } @else {
            <span>Buscar</span>
          }
        </button>
      </div>

      <!-- Grid de productos -->
      <div class="productos-contenedor">
        @if (cargando) {
          <div class="pos-loading">
            <div class="spinner"></div>
            <p>Cargando catálogo de productos...</p>
          </div>
        } @else if (productos.length === 0) {
          <div class="pos-empty">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            <p class="empty-title">No se encontraron productos</p>
            <p class="empty-sub">Intenta con otro término o código en el buscador</p>
          </div>
        } @else {
          <div class="productos-grid">
            @for (prod of productos; track prod.id) {
              <div
                class="producto-card"
                [class.producto-card--agotado]="esAgotado(prod)"
                (click)="onSeleccionar(prod)"
              >
                <div class="producto-card__header">
                  <span class="producto-categoria">{{ prod.nombreCategoria || 'General' }}</span>
                  @if (prod.codigo || prod.sku) {
                    <span class="producto-codigo">{{ prod.codigo || prod.sku }}</span>
                  }
                </div>

                <h4 class="producto-nombre" [title]="prod.nombre">{{ prod.nombre }}</h4>

                <div class="producto-card__footer">
                  <div class="producto-precio-stock">
                    <span class="producto-precio">Q{{ prod.precio | number:'1.2-2' }}</span>
                    <span
                      class="producto-stock-badge"
                      [ngClass]="obtenerClaseStock(prod)"
                    >
                      {{ obtenerTextoStock(prod) }}
                    </span>
                  </div>

                  <button
                    type="button"
                    class="btn-agregar-item"
                    [disabled]="esAgotado(prod)"
                    (click)="onBotonClick($event, prod)"
                    title="Agregar al carrito"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .pos-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 0.85rem;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .busqueda-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      gap: 0.75rem;
      background: #ffffff;
    }

    .busqueda-input-wrapper {
      position: relative;
      flex: 1;
      display: flex;
      align-items: center;
    }

    .busqueda-icon {
      position: absolute;
      left: 0.85rem;
      width: 1.1rem;
      height: 1.1rem;
      color: #94a3b8;
      pointer-events: none;
    }

    .busqueda-input {
      width: 100%;
      height: 2.6rem;
      padding: 0 2.2rem 0 2.5rem;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 0.6rem;
      font-size: 0.88rem;
      color: #1e293b;
      transition: all 0.2s ease;
    }

    .busqueda-input:focus {
      outline: none;
      background: #ffffff;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
    }

    .btn-limpiar {
      position: absolute;
      right: 0.75rem;
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1.2rem;
      line-height: 1;
      cursor: pointer;
      padding: 0.2rem;
    }

    .btn-limpiar:hover {
      color: #475569;
    }

    .btn-buscar {
      height: 2.6rem;
      padding: 0 1.25rem;
      background: #4f46e5;
      color: #ffffff;
      border: none;
      border-radius: 0.6rem;
      font-size: 0.85rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.18s ease;
      flex-shrink: 0;
    }

    .btn-buscar:hover:not(:disabled) {
      background: #4338ca;
    }

    .btn-buscar:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .spinner-sm {
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .productos-contenedor {
      flex: 1;
      padding: 1.25rem;
      overflow-y: auto;
      max-height: calc(100vh - 240px);
      min-height: 380px;
      background: #fafbff;
    }

    .productos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
      gap: 0.9rem;
    }

    .producto-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 0.75rem;
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
    }

    .producto-card:hover:not(.producto-card--agotado) {
      transform: translateY(-2px);
      border-color: #c7d2fe;
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.08);
    }

    .producto-card--agotado {
      opacity: 0.6;
      background: #f8fafc;
      cursor: not-allowed;
    }

    .producto-card__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
    }

    .producto-categoria {
      display: inline-block;
      padding: 0.12rem 0.5rem;
      background: rgba(99, 102, 241, 0.08);
      color: #6366f1;
      border-radius: 999px;
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .producto-codigo {
      font-size: 0.7rem;
      color: #94a3b8;
      font-family: monospace;
      font-weight: 600;
    }

    .producto-nombre {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 2.4rem;
    }

    .producto-card__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.5rem;
      border-top: 1px solid #f1f5f9;
    }

    .producto-precio-stock {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .producto-precio {
      font-size: 1.05rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    .producto-stock-badge {
      font-size: 0.7rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      padding: 0.1rem 0.4rem;
      border-radius: 0.35rem;
      width: fit-content;
    }

    .stock--ok {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .stock--bajo {
      background: rgba(245, 158, 11, 0.12);
      color: #d97706;
    }

    .stock--agotado {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .btn-agregar-item {
      width: 2.2rem;
      height: 2.2rem;
      border-radius: 0.55rem;
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.18s ease;
      flex-shrink: 0;
    }

    .btn-agregar-item svg {
      width: 1.1rem;
      height: 1.1rem;
    }

    .btn-agregar-item:hover:not(:disabled) {
      background: #4f46e5;
      color: #ffffff;
      border-color: #4f46e5;
    }

    .btn-agregar-item:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .pos-loading, .pos-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 3rem 1.5rem;
      color: #64748b;
    }

    .spinner {
      width: 2.2rem;
      height: 2.2rem;
      border: 3px solid #e2e8f0;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 1rem;
    }

    .empty-icon {
      width: 3rem;
      height: 3rem;
      color: #cbd5e1;
      margin-bottom: 0.75rem;
    }

    .empty-title {
      margin: 0 0 0.25rem;
      font-size: 0.95rem;
      font-weight: 700;
      color: #334155;
    }

    .empty-sub {
      margin: 0;
      font-size: 0.8rem;
      color: #94a3b8;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class BusquedaProductosComponent {
  @Input() productos: ProductoDto[] = [];
  @Input() cargando: boolean = false;
  @Input() filtroTexto: string = '';

  @Output() buscar = new EventEmitter<string>();
  @Output() seleccionar = new EventEmitter<ProductoDto>();

  onFiltroChange(valor: string): void {
    this.filtroTexto = valor;
  }

  ejecutarBusqueda(): void {
    this.buscar.emit(this.filtroTexto.trim());
  }

  limpiarFiltro(): void {
    this.filtroTexto = '';
    this.buscar.emit('');
  }

  onSeleccionar(producto: ProductoDto): void {
    if (!this.esAgotado(producto)) {
      this.seleccionar.emit(producto);
    }
  }

  onBotonClick(evento: Event, producto: ProductoDto): void {
    evento.stopPropagation();
    if (!this.esAgotado(producto)) {
      this.seleccionar.emit(producto);
    }
  }

  obtenerStock(producto: ProductoDto): number {
    return producto.stockActual ?? producto.stock ?? 0;
  }

  esAgotado(producto: ProductoDto): boolean {
    return this.obtenerStock(producto) <= 0;
  }

  obtenerClaseStock(producto: ProductoDto): string {
    const stock = this.obtenerStock(producto);
    if (stock <= 0) return 'stock--agotado';
    if (producto.stockBajo || stock <= (producto.stockMinimo ?? 5)) return 'stock--bajo';
    return 'stock--ok';
  }

  obtenerTextoStock(producto: ProductoDto): string {
    const stock = this.obtenerStock(producto);
    if (stock <= 0) return 'Agotado';
    return `${stock} en stock`;
  }
}
