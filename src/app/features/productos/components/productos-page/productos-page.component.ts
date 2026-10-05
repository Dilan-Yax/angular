import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ProductoService } from '../../services/producto.service';
import { ProductoDto, ProductoFilterDto } from '../../models/producto.model';

@Component({
  selector: 'app-productos-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="productos-container">
      <!-- Encabezado -->
      <header class="header-section">
        <div>
          <h1 class="header-title">Catálogo de Productos</h1>
          <p class="header-subtitle">
            Gestión y control de inventario
            <span class="total-badge">{{ totalItems() }} registrados</span>
          </p>
        </div>
        <button type="button" class="btn-primary" (click)="onNuevoProducto()">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo Producto
        </button>
      </header>

      <!-- Barra superior de búsqueda y acciones -->
      <div class="toolbar-section">
        <form class="search-form" (submit)="onBuscar($event)">
          <div class="search-input-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              class="search-input"
              placeholder="Buscar por código o nombre..."
              [ngModel]="filtroNombre()"
              (ngModelChange)="filtroNombre.set($event)"
              name="filtroNombre"
            />
            @if (filtroNombre()) {
              <button type="button" class="clear-btn" (click)="onLimpiarFiltro()" title="Limpiar filtro">
                ×
              </button>
            }
          </div>
          <button type="submit" class="btn-secondary" [disabled]="cargando()">
            Buscar
          </button>
        </form>

        <div class="toolbar-stats">
          Página {{ paginaActual() }} de {{ totalPaginas() }}
        </div>
      </div>

      <!-- Contenedor de la Tabla y Spinner -->
      <div class="table-container">
        @if (cargando()) {
          <div class="loading-overlay">
            <div class="spinner"></div>
            <p class="loading-text">Cargando productos...</p>
          </div>
        }

        <table class="data-table">
          <thead>
            <tr>
              <th scope="col">Código/SKU</th>
              <th scope="col">Nombre</th>
              <th scope="col" class="text-right">Precio</th>
              <th scope="col" class="text-center">Stock</th>
              <th scope="col" class="text-center">Estado</th>
              <th scope="col" class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (prod of productos(); track prod.id) {
              <tr class="table-row">
                <td class="font-mono text-sm font-semibold text-slate-700">
                  {{ prod.codigo || prod.sku || ('PRD-' + prod.id) }}
                </td>
                <td>
                  <div class="font-medium text-slate-900">{{ prod.nombre }}</div>
                  @if (prod.nombreCategoria) {
                    <div class="text-xs text-slate-500">{{ prod.nombreCategoria }}</div>
                  }
                </td>
                <td class="text-right font-medium text-slate-900">
                  {{ prod.precio | currency:'USD':'symbol':'1.2-2' }}
                </td>
                <td class="text-center">
                  <div class="stock-cell">
                    <span class="font-medium">{{ prod.stockActual ?? prod.stock ?? 0 }}</span>
                    @if (esStockBajo(prod)) {
                      <span class="badge badge-warning">Stock bajo</span>
                    }
                  </div>
                </td>
                <td class="text-center">
                  @if (prod.isActive ?? (prod.estado === 'disponible' || prod.estado === 'activo' || !prod.estado)) {
                    <span class="badge badge-success">Activo</span>
                  } @else {
                    <span class="badge badge-danger">Inactivo</span>
                  }
                </td>
                <td class="text-center">
                  <div class="actions-group">
                    <button
                      type="button"
                      class="action-btn edit-btn"
                      title="Editar producto"
                      (click)="onEditarProducto(prod)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="action-btn delete-btn"
                      title="Eliminar producto"
                      (click)="onEliminarProducto(prod)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              @if (!cargando()) {
                <tr>
                  <td colspan="6" class="empty-state">
                    <div class="empty-state-content">
                      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                      <p class="empty-title">No se encontraron productos</p>
                      <p class="empty-subtitle">
                        {{ filtroNombre() ? 'Intenta con otro término de búsqueda.' : 'Agrega el primer producto al inventario.' }}
                      </p>
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- Paginador -->
      @if (totalPaginas() > 1) {
        <footer class="pagination-footer">
          <div class="text-sm text-slate-500">
            Total: {{ totalItems() }} resultados
          </div>
          <div class="pagination-controls">
            <button
              type="button"
              class="page-btn"
              [disabled]="paginaActual() <= 1 || cargando()"
              (click)="cambiarPagina(paginaActual() - 1)">
              Anterior
            </button>
            <span class="page-indicator">
              {{ paginaActual() }} / {{ totalPaginas() }}
            </span>
            <button
              type="button"
              class="page-btn"
              [disabled]="paginaActual() >= totalPaginas() || cargando()"
              (click)="cambiarPagina(paginaActual() + 1)">
              Siguiente
            </button>
          </div>
        </footer>
      }
    </div>
  `,
  styles: [`
    .productos-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.25rem 1.75rem;
      background: #ffffff;
      border-radius: 0.85rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .header-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    .header-subtitle {
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .total-badge {
      display: inline-block;
      padding: 0.15rem 0.6rem;
      border-radius: 9999px;
      background: rgba(99, 102, 241, 0.1);
      color: #4f46e5;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.25rem;
      background: #4f46e5;
      color: #ffffff;
      font-size: 0.875rem;
      font-weight: 600;
      border: none;
      border-radius: 0.6rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
      transition: all 0.2s ease;
    }

    .btn-primary:hover {
      background: #4338ca;
      transform: translateY(-1px);
    }

    .btn-icon {
      width: 1.1rem;
      height: 1.1rem;
    }

    .toolbar-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .search-form {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
      max-width: 480px;
    }

    .search-input-wrapper {
      position: relative;
      flex: 1;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 0.85rem;
      width: 1rem;
      height: 1rem;
      color: #94a3b8;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 0.6rem 2.2rem 0.6rem 2.4rem;
      font-size: 0.875rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.6rem;
      background: #ffffff;
      color: #1e293b;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .search-input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }

    .clear-btn {
      position: absolute;
      right: 0.75rem;
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1.25rem;
      line-height: 1;
      cursor: pointer;
      padding: 0;
    }

    .btn-secondary {
      padding: 0.6rem 1.1rem;
      font-size: 0.875rem;
      font-weight: 600;
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #cbd5e1;
      border-radius: 0.6rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #e2e8f0;
      color: #0f172a;
    }

    .btn-secondary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .toolbar-stats {
      font-size: 0.85rem;
      color: #64748b;
    }

    .table-container {
      position: relative;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 0.85rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      min-height: 250px;
    }

    .loading-overlay {
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(2px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }

    .spinner {
      width: 2.2rem;
      height: 2.2rem;
      border: 3px solid #e2e8f0;
      border-top-color: #4f46e5;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .loading-text {
      margin-top: 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #4f46e5;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .data-table th {
      padding: 0.85rem 1.25rem;
      font-size: 0.75rem;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .data-table td {
      padding: 1rem 1.25rem;
      font-size: 0.875rem;
      color: #334155;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }

    .table-row:hover {
      background-color: #f8fafc;
    }

    .text-right { text-align: right; }
    .text-center { text-align: center; }

    .stock-cell {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: center;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      line-height: 1;
    }

    .badge-success {
      background: #dcfce7;
      color: #15803d;
    }

    .badge-danger {
      background: #fee2e2;
      color: #b91c1c;
    }

    .badge-warning {
      background: #fef3c7;
      color: #b45309;
    }

    .actions-group {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .action-btn {
      width: 2rem;
      height: 2rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.45rem;
      border: 1px solid transparent;
      background: transparent;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .action-btn svg {
      width: 1rem;
      height: 1rem;
    }

    .edit-btn {
      color: #2563eb;
    }
    .edit-btn:hover {
      background: #eff6ff;
      border-color: #bfdbfe;
    }

    .delete-btn {
      color: #dc2626;
    }
    .delete-btn:hover {
      background: #fef2f2;
      border-color: #fecaca;
    }

    .empty-state {
      padding: 3.5rem 1rem !important;
      text-align: center;
    }

    .empty-state-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .empty-icon {
      width: 2.75rem;
      height: 2.75rem;
      color: #94a3b8;
    }

    .empty-title {
      font-size: 1rem;
      font-weight: 600;
      color: #334155;
      margin: 0;
    }

    .empty-subtitle {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0;
    }

    .pagination-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.5rem 0.25rem;
      flex-wrap: wrap;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .page-btn {
      padding: 0.45rem 0.85rem;
      font-size: 0.85rem;
      font-weight: 500;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 0.5rem;
      color: #334155;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .page-btn:hover:not(:disabled) {
      background: #f8fafc;
      border-color: #94a3b8;
    }

    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-indicator {
      font-size: 0.85rem;
      font-weight: 600;
      color: #475569;
    }
  `]
})
export class ProductosPageComponent implements OnInit {
  private productoService = inject(ProductoService);

  // Signals requeridos
  productos = signal<ProductoDto[]>([]);
  totalItems = signal<number>(0);
  cargando = signal<boolean>(false);
  filtroNombre = signal<string>('');
  paginaActual = signal<number>(1);
  pageSize = signal<number>(10);

  // Computeds auxiliares
  totalPaginas = computed(() => {
    const total = this.totalItems();
    const size = this.pageSize();
    return Math.max(1, Math.ceil(total / size));
  });

  ngOnInit(): void {
    this.cargarProductos();
  }

  async cargarProductos(): Promise<void> {
    this.cargando.set(true);
    try {
      const res = await firstValueFrom(
        this.productoService.getProductos({
          pageNumber: this.paginaActual(),
          pageSize: this.pageSize(),
          search: this.filtroNombre() || undefined,
        })
      );
      const items = res?.items ?? [];
      this.productos.set(items);
      this.totalItems.set(res?.totalCount ?? 0);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      this.productos.set([]);
      this.totalItems.set(0);
    } finally {
      this.cargando.set(false);
    }
  }

  onBuscar(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.paginaActual.set(1);
    this.cargarProductos();
  }

  onLimpiarFiltro(): void {
    this.filtroNombre.set('');
    this.paginaActual.set(1);
    this.cargarProductos();
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas() && nuevaPagina !== this.paginaActual()) {
      this.paginaActual.set(nuevaPagina);
      this.cargarProductos();
    }
  }

  esStockBajo(prod: ProductoDto): boolean {
    if (prod.stockBajo !== undefined && prod.stockBajo !== null) {
      return prod.stockBajo;
    }
    const stock = prod.stockActual ?? prod.stock ?? 0;
    const min = prod.stockMinimo ?? 5;
    return stock <= min;
  }

  onNuevoProducto(): void {
    console.log('Nuevo producto solicitado');
  }

  onEditarProducto(prod: ProductoDto): void {
    console.log('Editar producto:', prod);
  }

  onEliminarProducto(prod: ProductoDto): void {
    console.log('Eliminar producto:', prod);
  }
}
