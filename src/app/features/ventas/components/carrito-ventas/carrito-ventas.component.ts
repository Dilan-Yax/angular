import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemCarrito } from '../../models/venta.model';

@Component({
  selector: 'app-carrito-ventas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pos-card carrito-panel">
      <!-- Encabezado del carrito -->
      <div class="carrito-header">
        <div class="carrito-title-wrap">
          <span class="carrito-badge">{{ totalArticulos }}</span>
          <h3 class="carrito-title">Detalle de la Venta</h3>
        </div>
        @if (items.length > 0) {
          <button
            type="button"
            class="btn-vaciar"
            (click)="onVaciar()"
            [disabled]="deshabilitado"
            title="Vaciar todo el carrito"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span>Vaciar</span>
          </button>
        }
      </div>

      <!-- Lista de items del carrito -->
      <div class="carrito-body">
        @if (items.length === 0) {
          <div class="carrito-empty">
            <div class="empty-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <p class="empty-text">El carrito está vacío</p>
            <span class="empty-hint">Haz clic en los productos del catálogo para agregarlos</span>
          </div>
        } @else {
          <div class="items-list">
            @for (item of items; track item.producto.id) {
              <div class="carrito-item">
                <div class="item-info">
                  <h5 class="item-nombre">{{ item.producto.nombre }}</h5>
                  <div class="item-meta">
                    <span class="item-precio-unit">Q{{ item.precioUnitario | number:'1.2-2' }} c/u</span>
                    @if (item.producto.codigo) {
                      <span class="item-sku">· {{ item.producto.codigo }}</span>
                    }
                  </div>
                </div>

                <!-- Controles de cantidad -->
                <div class="item-controles">
                  <button
                    type="button"
                    class="btn-qty"
                    [disabled]="deshabilitado || item.cantidad <= 1"
                    (click)="disminuirCantidad(item)"
                    title="Disminuir cantidad"
                  >
                    -
                  </button>
                  <span class="item-cantidad">{{ item.cantidad }}</span>
                  <button
                    type="button"
                    class="btn-qty"
                    [disabled]="deshabilitado || item.cantidad >= obtenerStockMax(item)"
                    (click)="aumentarCantidad(item)"
                    title="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>

                <!-- Subtotal y eliminar -->
                <div class="item-subtotal-wrap">
                  <span class="item-subtotal">Q{{ item.subtotal | number:'1.2-2' }}</span>
                  <button
                    type="button"
                    class="btn-eliminar"
                    (click)="onEliminar(item.producto.id)"
                    [disabled]="deshabilitado"
                    title="Quitar producto"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Pie del carrito con subtotales -->
      @if (items.length > 0) {
        <div class="carrito-footer">
          <div class="resumen-fila">
            <span class="resumen-label">Subtotal</span>
            <span class="resumen-valor">Q{{ total | number:'1.2-2' }}</span>
          </div>
          <div class="resumen-fila resumen-fila--total">
            <span class="resumen-label-total">Total a Pagar</span>
            <span class="resumen-valor-total">Q{{ total | number:'1.2-2' }}</span>
          </div>
        </div>
      }
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

    .carrito-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #ffffff;
    }

    .carrito-title-wrap {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .carrito-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.6rem;
      height: 1.6rem;
      border-radius: 50%;
      background: #4f46e5;
      color: #ffffff;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .carrito-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
    }

    .btn-vaciar {
      background: transparent;
      border: none;
      color: #ef4444;
      font-size: 0.78rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 0.4rem;
      transition: background 0.15s ease;
    }

    .btn-vaciar svg {
      width: 0.95rem;
      height: 0.95rem;
    }

    .btn-vaciar:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.08);
    }

    .btn-vaciar:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .carrito-body {
      flex: 1;
      overflow-y: auto;
      padding: 0.75rem 1rem;
      max-height: calc(100vh - 360px);
      min-height: 240px;
    }

    .carrito-empty {
      height: 100%;
      min-height: 220px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: #64748b;
      padding: 2rem 1rem;
    }

    .empty-icon-wrap {
      width: 3.2rem;
      height: 3.2rem;
      border-radius: 50%;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      margin-bottom: 0.85rem;
    }

    .empty-icon-wrap svg {
      width: 1.6rem;
      height: 1.6rem;
    }

    .empty-text {
      margin: 0 0 0.25rem;
      font-weight: 700;
      color: #334155;
      font-size: 0.95rem;
    }

    .empty-hint {
      font-size: 0.8rem;
      color: #94a3b8;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .carrito-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.75rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.65rem;
      transition: background 0.15s ease;
    }

    .carrito-item:hover {
      background: #f1f5f9;
    }

    .item-info {
      flex: 1;
      min-width: 0;
    }

    .item-nombre {
      margin: 0 0 0.2rem;
      font-size: 0.86rem;
      font-weight: 700;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-meta {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      color: #64748b;
    }

    .item-precio-unit {
      font-weight: 600;
    }

    .item-sku {
      color: #94a3b8;
      font-family: monospace;
    }

    .item-controles {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 0.5rem;
      padding: 0.15rem 0.25rem;
    }

    .btn-qty {
      width: 1.6rem;
      height: 1.6rem;
      border-radius: 0.35rem;
      border: none;
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.95rem;
      line-height: 1;
      transition: all 0.15s ease;
    }

    .btn-qty:hover:not(:disabled) {
      background: #e2e8f0;
      color: #0f172a;
    }

    .btn-qty:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .item-cantidad {
      min-width: 1.6rem;
      text-align: center;
      font-size: 0.85rem;
      font-weight: 700;
      color: #0f172a;
    }

    .item-subtotal-wrap {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      min-width: 80px;
      justify-content: flex-end;
    }

    .item-subtotal {
      font-size: 0.92rem;
      font-weight: 800;
      color: #0f172a;
    }

    .btn-eliminar {
      background: transparent;
      border: none;
      color: #94a3b8;
      padding: 0.2rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.35rem;
      transition: all 0.15s ease;
    }

    .btn-eliminar svg {
      width: 1rem;
      height: 1rem;
    }

    .btn-eliminar:hover:not(:disabled) {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.08);
    }

    .carrito-footer {
      padding: 1rem 1.25rem;
      border-top: 2px solid #f1f5f9;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .resumen-fila {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      color: #64748b;
    }

    .resumen-fila--total {
      padding-top: 0.4rem;
      border-top: 1px dashed #e2e8f0;
      margin-top: 0.2rem;
    }

    .resumen-label-total {
      font-size: 1rem;
      font-weight: 800;
      color: #0f172a;
    }

    .resumen-valor-total {
      font-size: 1.25rem;
      font-weight: 800;
      color: #4f46e5;
      letter-spacing: -0.02em;
    }
  `]
})
export class CarritoVentasComponent {
  @Input() items: ItemCarrito[] = [];
  @Input() total: number = 0;
  @Input() totalArticulos: number = 0;
  @Input() deshabilitado: boolean = false;

  @Output() cambiarCantidad = new EventEmitter<{ productoId: number; cantidad: number }>();
  @Output() eliminar = new EventEmitter<number>();
  @Output() vaciar = new EventEmitter<void>();

  obtenerStockMax(item: ItemCarrito): number {
    return item.producto.stockActual ?? item.producto.stock ?? 9999;
  }

  aumentarCantidad(item: ItemCarrito): void {
    const max = this.obtenerStockMax(item);
    if (item.cantidad < max) {
      this.cambiarCantidad.emit({
        productoId: item.producto.id,
        cantidad: item.cantidad + 1,
      });
    }
  }

  disminuirCantidad(item: ItemCarrito): void {
    if (item.cantidad > 1) {
      this.cambiarCantidad.emit({
        productoId: item.producto.id,
        cantidad: item.cantidad - 1,
      });
    }
  }

  onEliminar(productoId: number): void {
    this.eliminar.emit(productoId);
  }

  onVaciar(): void {
    this.vaciar.emit();
  }
}
