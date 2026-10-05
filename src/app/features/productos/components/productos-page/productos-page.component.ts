import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ProductoService } from '../../services/producto.service';
import { CategoriaService } from '../../../categorias/services/categoria.service';
import {
  ActualizarProductoDto,
  CrearProductoDto,
  ProductoDetalleDto,
  ProductoDto,
  ProductoFilterDto,
} from '../../models/producto.model';
import { CategoriaDto } from '../../../categorias/models/categoria.model';
import { TablaProductosComponent } from '../tabla-productos/tabla-productos.component';
import { FiltrosProductosComponent } from '../filtros-productos/filtros-productos.component';
import { FormularioProductoModalComponent } from '../formulario-producto-modal/formulario-producto-modal.component';
import { PaginadorComponent } from '../../../usuarios/components/paginador/paginador.component';

@Component({
  selector: 'app-productos-page',
  standalone: true,
  imports: [
    CommonModule,
    TablaProductosComponent,
    FiltrosProductosComponent,
    FormularioProductoModalComponent,
    PaginadorComponent,
  ],
  template: `
    <div class="productos-layout">
      <!-- Encabezado / Panel de Control -->
      <div class="panel-header mb-4">
        <div>
          <h2 class="panel-titulo">Catálogo de Productos</h2>
          <p class="panel-subtitulo">
            Gestión y control de inventario
            <span class="badge-total">{{ totalItems() }} registrados</span>
          </p>
        </div>

        <div class="header-actions">
          <button
            type="button"
            class="btn-refrescar"
            (click)="cargarProductos()"
            [disabled]="cargando()"
            title="Refrescar catálogo"
          >
            <svg class="icon-sm" [class.animate-spin]="cargando()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
            <span>Actualizar</span>
          </button>

          <button
            type="button"
            class="btn-nuevo-producto"
            (click)="abrirCrear()"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      <!-- Alertas globales del módulo -->
      @if (alerta()) {
        <div class="alerta-box" [ngClass]="'alerta-box--' + alerta()?.tipo">
          <div class="d-flex align-items-center gap-2">
            @if (alerta()?.tipo === 'exito') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            } @else if (alerta()?.tipo === 'advertencia') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            } @else {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            }
            <span>{{ alerta()?.mensaje }}</span>
          </div>
          <button type="button" class="btn-cerrar-alerta" (click)="alerta.set(null)">×</button>
        </div>
      }

      <!-- Presentacional: Barra de Filtros -->
      <app-filtros-productos
        [categorias]="categorias()"
        (filtrar)="onFiltrar($event)"
        (limpiar)="onLimpiarFiltros()"
      />

      <!-- Presentacional: Tabla de Productos -->
      <app-tabla-productos
        [productos]="productos()"
        [cargando]="cargando()"
        (editar)="abrirEditar($event)"
        (desactivar)="ejecutarDesactivar($event)"
      />

      <!-- Presentacional Transversal: Paginador Reutilizable -->
      <div class="mt-3">
        <app-paginador
          [page]="paginaActual()"
          [pageSize]="pageSize()"
          [totalItems]="totalItems()"
          [totalPages]="totalPages()"
          (cambiarPagina)="cambiarPagina($event)"
          (cambiarTamano)="cambiarTamano($event)"
        />
      </div>

      <!-- Presentacional: Modal de Formulario (Creación / Edición / OCC 409) -->
      <app-formulario-producto-modal
        [visible]="modalVisible()"
        [producto]="productoSeleccionado()"
        [categorias]="categorias()"
        [guardando]="guardando()"
        [concurrenciaConflicto]="concurrenciaConflicto()"
        (guardar)="ejecutarGuardar($event)"
        (recargar)="ejecutarRecargar($event)"
        (cancelar)="cerrarModal()"
      />
    </div>
  `,
  styles: [`
    .productos-layout {
      display: flex;
      flex-direction: column;
      padding: 0.5rem 0;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.25rem 1.75rem;
      border-radius: 0.85rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    }

    .panel-titulo {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    .panel-subtitulo {
      margin: 0.25rem 0 0;
      font-size: 0.85rem;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .badge-total {
      display: inline-block;
      padding: 0.15rem 0.6rem;
      border-radius: 9999px;
      background: rgba(99, 102, 241, 0.1);
      color: #4f46e5;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .btn-refrescar {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      color: #334155;
      padding: 0.55rem 1rem;
      border-radius: 0.55rem;
      font-size: 0.84rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-refrescar:hover:not(:disabled) {
      background: #f1f5f9;
      color: #0f172a;
    }

    .btn-refrescar:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-nuevo-producto {
      background: #4f46e5;
      color: #ffffff;
      border: none;
      padding: 0.6rem 1.25rem;
      border-radius: 0.55rem;
      font-size: 0.86rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
      transition: all 0.18s ease;
    }

    .btn-nuevo-producto svg {
      width: 1.1rem;
      height: 1.1rem;
    }

    .btn-nuevo-producto:hover {
      background: #4338ca;
    }

    .icon-sm {
      width: 1rem;
      height: 1rem;
    }

    .animate-spin {
      animation: spin 0.8s linear infinite;
    }

    .alerta-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.85rem 1.25rem;
      border-radius: 0.65rem;
      font-size: 0.88rem;
      font-weight: 600;
      margin-bottom: 1.25rem;
      border: 1px solid transparent;
    }

    .alerta-box svg {
      width: 1.2rem;
      height: 1.2rem;
      flex-shrink: 0;
    }

    .alerta-box--exito {
      background: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.25);
      color: #065f46;
    }

    .alerta-box--advertencia {
      background: #fffbeb;
      border-color: #fde68a;
      color: #92400e;
    }

    .alerta-box--error {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.25);
      color: #991b1b;
    }

    .btn-cerrar-alerta {
      background: transparent;
      border: none;
      font-size: 1.3rem;
      color: currentColor;
      opacity: 0.7;
      cursor: pointer;
      line-height: 1;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class ProductosPageComponent implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);

  // Signals de Estado
  readonly productos = signal<ProductoDto[]>([]);
  readonly totalItems = signal<number>(0);
  readonly totalPages = signal<number>(1);
  readonly cargando = signal<boolean>(false);
  readonly guardando = signal<boolean>(false);
  readonly paginaActual = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly filtrosActuales = signal<ProductoFilterDto>({});
  readonly categorias = signal<CategoriaDto[]>([]);

  // Signals de Modal y Concurrencia (OCC)
  readonly modalVisible = signal<boolean>(false);
  readonly productoSeleccionado = signal<ProductoDetalleDto | null>(null);
  readonly concurrenciaConflicto = signal<boolean>(false);

  // Alerta informativa
  readonly alerta = signal<{ tipo: 'exito' | 'error' | 'advertencia'; mensaje: string } | null>(null);

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarProductos();
  }

  async cargarCategorias(): Promise<void> {
    try {
      const res = await firstValueFrom(this.categoriaService.getCategorias());
      this.categorias.set(res ?? []);
    } catch (err) {
      console.error('Error al cargar categorías para filtro:', err);
    }
  }

  async cargarProductos(): Promise<void> {
    this.cargando.set(true);
    try {
      const f = this.filtrosActuales();
      const res = await firstValueFrom(
        this.productoService.getProductos({
          pageNumber: this.paginaActual(),
          pageSize: this.pageSize(),
          searchTerm: f.searchTerm,
          categoriaId: f.categoriaId,
          isActive: f.isActive,
          soloStockBajo: f.soloStockBajo,
        })
      );
      const items = res?.items ?? [];
      this.productos.set(items);
      this.totalItems.set(res?.totalCount ?? 0);
      this.totalPages.set(
        res?.totalPages ?? Math.max(1, Math.ceil((res?.totalCount ?? 0) / this.pageSize()))
      );
    } catch (error) {
      console.error('Error al cargar productos:', error);
      this.productos.set([]);
      this.totalItems.set(0);
      this.totalPages.set(1);
      this.alerta.set({
        tipo: 'error',
        mensaje: 'Error al conectar con el servidor para obtener los productos.',
      });
    } finally {
      this.cargando.set(false);
    }
  }

  onFiltrar(filtro: ProductoFilterDto): void {
    this.filtrosActuales.set(filtro);
    this.paginaActual.set(1);
    this.cargarProductos();
  }

  onLimpiarFiltros(): void {
    this.filtrosActuales.set({});
    this.paginaActual.set(1);
    this.cargarProductos();
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPages() && nuevaPagina !== this.paginaActual()) {
      this.paginaActual.set(nuevaPagina);
      this.cargarProductos();
    }
  }

  cambiarTamano(nuevoTamano: number): void {
    if (nuevoTamano !== this.pageSize()) {
      this.pageSize.set(nuevoTamano);
      this.paginaActual.set(1);
      this.cargarProductos();
    }
  }

  abrirCrear(): void {
    this.productoSeleccionado.set(null);
    this.concurrenciaConflicto.set(false);
    this.modalVisible.set(true);
  }

  async abrirEditar(id: number): Promise<void> {
    this.cargando.set(true);
    try {
      const detalle = await firstValueFrom(this.productoService.getProducto(id));
      this.productoSeleccionado.set(detalle);
      this.concurrenciaConflicto.set(false);
      this.modalVisible.set(true);
    } catch (err) {
      console.error('Error al cargar detalle del producto:', err);
      this.alerta.set({
        tipo: 'error',
        mensaje: 'No fue posible obtener el detalle del producto para editar.',
      });
    } finally {
      this.cargando.set(false);
    }
  }

  cerrarModal(): void {
    this.modalVisible.set(false);
    this.productoSeleccionado.set(null);
    this.concurrenciaConflicto.set(false);
  }

  async ejecutarGuardar(event: {
    id?: number;
    data: CrearProductoDto | ActualizarProductoDto;
  }): Promise<void> {
    this.guardando.set(true);
    this.alerta.set(null);

    try {
      if (event.id) {
        // Actualización con OCC
        await firstValueFrom(
          this.productoService.actualizarProducto(event.id, event.data as ActualizarProductoDto)
        );
        this.modalVisible.set(false);
        this.productoSeleccionado.set(null);
        this.concurrenciaConflicto.set(false);
        this.alerta.set({
          tipo: 'exito',
          mensaje: '¡Producto actualizado correctamente!',
        });
      } else {
        // Creación
        await firstValueFrom(
          this.productoService.crearProducto(event.data as CrearProductoDto)
        );
        this.modalVisible.set(false);
        this.productoSeleccionado.set(null);
        this.alerta.set({
          tipo: 'exito',
          mensaje: '¡Producto registrado con éxito!',
        });
      }
      await this.cargarProductos();
    } catch (err: any) {
      console.error('Error al guardar producto:', err);
      // Captura de Concurrencia Optimista (OCC 409)
      if (err.status === 409) {
        this.concurrenciaConflicto.set(true);
        this.alerta.set({
          tipo: 'advertencia',
          mensaje:
            'Conflicto de concurrencia: El producto fue modificado por otro usuario. Debes recargar los datos antes de continuar.',
        });
      } else {
        const detalle =
          err.error?.detail || err.error?.title || 'No se pudo guardar el producto.';
        this.alerta.set({
          tipo: 'error',
          mensaje: `Error al guardar producto: ${detalle}`,
        });
      }
    } finally {
      this.guardando.set(false);
    }
  }

  async ejecutarRecargar(id: number): Promise<void> {
    try {
      this.cargando.set(true);
      const prodFresco = await firstValueFrom(this.productoService.getProducto(id));
      this.productoSeleccionado.set(prodFresco);
      this.concurrenciaConflicto.set(false);
      this.alerta.set({
        tipo: 'exito',
        mensaje: 'Datos recargados con la versión más reciente del servidor.',
      });
    } catch (err) {
      console.error('Error al recargar producto:', err);
      this.alerta.set({
        tipo: 'error',
        mensaje: 'No fue posible recargar la información del producto.',
      });
    } finally {
      this.cargando.set(false);
    }
  }

  async ejecutarDesactivar(id: number): Promise<void> {
    try {
      await firstValueFrom(this.productoService.desactivarProducto(id));
      this.alerta.set({
        tipo: 'exito',
        mensaje: 'Producto desactivado correctamente.',
      });
      await this.cargarProductos();
    } catch (err: any) {
      console.error('Error al desactivar producto:', err);
      const detalle =
        err.error?.detail || err.error?.title || 'No se pudo desactivar el producto.';
      this.alerta.set({
        tipo: 'error',
        mensaje: `Error al desactivar producto: ${detalle}`,
      });
    }
  }
}
