import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { VentaService } from '../../services/venta.service';
import { ProductoService } from '../../../productos/services/producto.service';
import { CajaService } from '../../../caja/services/caja.service';
import { ProductoDto } from '../../../productos/models/producto.model';
import { CajaSesionDto } from '../../../caja/models/caja.model';
import { ItemCarrito, VentaDto } from '../../models/venta.model';
import { BusquedaProductosComponent } from '../busqueda-productos/busqueda-productos.component';
import { CarritoVentasComponent } from '../carrito-ventas/carrito-ventas.component';
import { ConfirmarVentaComponent } from '../confirmar-venta/confirmar-venta.component';

@Component({
  selector: 'app-registro-ventas-page',
  standalone: true,
  imports: [
    CommonModule,
    BusquedaProductosComponent,
    CarritoVentasComponent,
    ConfirmarVentaComponent,
  ],
  template: `
    <div class="pos-layout">
      <!-- Panel de Control Superior (Estética Dashboard) -->
      <div class="panel mb-3">
        <div>
          <h2 class="panel__titulo">Terminal Punto de Venta (POS)</h2>
          <p class="panel__subtitulo mb-0">
            Registro ágil de ventas, control de inventario y facturación
          </p>
        </div>

        <div class="panel-kpi-wrap">
          <div class="kpi-mini">
            <span class="kpi-mini__etiqueta">Artículos</span>
            <span class="kpi-mini__valor">{{ totalArticulos() }}</span>
          </div>
          <div class="kpi-mini kpi-mini--destacado">
            <span class="kpi-mini__etiqueta">Total a Cobrar</span>
            <span class="kpi-mini__valor">Q{{ totalVenta() | number:'1.2-2' }}</span>
          </div>
        </div>
      </div>

      <!-- Alertas del sistema -->
      @if (alerta()) {
        <div class="pos-alerta" [ngClass]="'pos-alerta--' + alerta()?.tipo">
          <div class="pos-alerta__contenido">
            @if (alerta()?.tipo === 'exito') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            } @else if (alerta()?.tipo === 'error') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            } @else {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            }
            <span>{{ alerta()?.mensaje }}</span>
          </div>
          <button type="button" class="btn-cerrar-alerta" (click)="alerta.set(null)">×</button>
        </div>
      }

      <!-- Grid Principal: Catálogo (Izquierda) + Carrito & Cobro (Derecha) -->
      <div class="pos-grid">
        <!-- Columna Izquierda: Catálogo y Búsqueda -->
        <section class="pos-col-catalogo">
          <app-busqueda-productos
            [productos]="productos()"
            [cargando]="cargandoProductos()"
            [filtroTexto]="filtroTexto()"
            (buscar)="buscarProductos($event)"
            (seleccionar)="agregarAlCarrito($event)"
          />
        </section>

        <!-- Columna Derecha: Carrito y Confirmación -->
        <section class="pos-col-checkout">
          <!-- Carrito de Compras -->
          <div class="pos-checkout-carrito">
            <app-carrito-ventas
              [items]="carrito()"
              [total]="totalVenta()"
              [totalArticulos]="totalArticulos()"
              [deshabilitado]="procesandoVenta()"
              (cambiarCantidad)="cambiarCantidad($event)"
              (eliminar)="eliminarItem($event)"
              (vaciar)="vaciarCarrito()"
            />
          </div>

          <!-- Panel de Confirmación / Cobro -->
          <div class="pos-checkout-confirmacion">
            <app-confirmar-venta
              [total]="totalVenta()"
              [totalArticulos]="totalArticulos()"
              [tieneCajaAbierta]="tieneCajaAbierta()"
              [cajaActual]="cajaActual()"
              [procesando]="procesandoVenta()"
              (confirmar)="ejecutarConfirmacionVenta()"
              (irACaja)="navegarACaja()"
            />
          </div>
        </section>
      </div>

      <!-- Modal de Ticket / Resumen de Venta Exitosa -->
      @if (ticketVenta()) {
        <div class="modal-overlay">
          <div class="ticket-modal">
            <div class="ticket-header">
              <div class="ticket-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h3 class="ticket-titulo">¡Venta Registrada con Éxito!</h3>
              <p class="ticket-subtitulo">Comprobante #{{ ticketVenta()?.id }}</p>
            </div>

            <div class="ticket-body">
              <div class="ticket-info-row">
                <span class="ticket-label">Fecha y Hora:</span>
                <span class="ticket-val">{{ ticketVenta()?.fechaVenta | date:'short' }}</span>
              </div>
              <div class="ticket-info-row">
                <span class="ticket-label">Total Cobrado:</span>
                <span class="ticket-val ticket-val--destacado">Q{{ ticketVenta()?.total | number:'1.2-2' }}</span>
              </div>
              <div class="ticket-info-row">
                <span class="ticket-label">Líneas de producto:</span>
                <span class="ticket-val">{{ ticketVenta()?.detalles?.length || 0 }} ítems</span>
              </div>
            </div>

            <div class="ticket-footer">
              <button type="button" class="btn-ticket-cerrar" (click)="ticketVenta.set(null)">
                Continuar Vendiendo
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .pos-layout {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 0.5rem 0;
    }

    /* ── Panel superior (estética Dashboard) ───────────────────────────────── */
    .panel {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.1rem 1.5rem;
      border-radius: 0.85rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    }

    .panel__titulo {
      margin: 0 0 0.2rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.01em;
    }

    .panel__subtitulo {
      color: #64748b;
      font-size: 0.85rem;
      margin: 0;
    }

    .panel-kpi-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .kpi-mini {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      padding: 0.4rem 0.85rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.6rem;
    }

    .kpi-mini--destacado {
      background: rgba(99, 102, 241, 0.08);
      border-color: rgba(99, 102, 241, 0.2);
    }

    .kpi-mini__etiqueta {
      font-size: 0.7rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .kpi-mini__valor {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
    }

    .kpi-mini--destacado .kpi-mini__valor {
      color: #4f46e5;
    }

    /* ── Alertas ───────────────────────────────── */
    .pos-alerta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.75rem 1.25rem;
      border-radius: 0.65rem;
      font-size: 0.88rem;
      font-weight: 600;
      border: 1px solid transparent;
      animation: fadeIn 0.2s ease;
    }

    .pos-alerta__contenido {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .pos-alerta__contenido svg {
      width: 1.2rem;
      height: 1.2rem;
      flex-shrink: 0;
    }

    .pos-alerta--exito {
      background: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.25);
      color: #065f46;
    }

    .pos-alerta--error {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.25);
      color: #991b1b;
    }

    .pos-alerta--advertencia {
      background: rgba(245, 158, 11, 0.1);
      border-color: rgba(245, 158, 11, 0.25);
      color: #92400e;
    }

    .btn-cerrar-alerta {
      background: transparent;
      border: none;
      font-size: 1.25rem;
      color: currentColor;
      opacity: 0.7;
      cursor: pointer;
      padding: 0 0.25rem;
      line-height: 1;
    }

    .btn-cerrar-alerta:hover {
      opacity: 1;
    }

    /* ── Layout Grid POS ───────────────────────────────── */
    .pos-grid {
      display: grid;
      grid-template-columns: 1fr 440px;
      gap: 1.25rem;
      align-items: start;
    }

    .pos-col-catalogo {
      min-width: 0;
    }

    .pos-col-checkout {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    /* ── Modal de Ticket ───────────────────────────────── */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(3px);
      z-index: 1050;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .ticket-modal {
      background: #ffffff;
      border-radius: 1rem;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .ticket-header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      padding: 1.75rem 1.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .ticket-icon-wrap {
      width: 3.2rem;
      height: 3.2rem;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.75rem;
    }

    .ticket-icon-wrap svg {
      width: 1.6rem;
      height: 1.6rem;
    }

    .ticket-titulo {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 800;
    }

    .ticket-subtitulo {
      margin: 0.2rem 0 0;
      font-size: 0.85rem;
      opacity: 0.9;
    }

    .ticket-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .ticket-info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.88rem;
    }

    .ticket-label {
      color: #64748b;
      font-weight: 600;
    }

    .ticket-val {
      color: #1e293b;
      font-weight: 700;
    }

    .ticket-val--destacado {
      font-size: 1.2rem;
      color: #10b981;
      font-weight: 800;
    }

    .ticket-footer {
      padding: 1.25rem 1.5rem;
      background: #ffffff;
    }

    .btn-ticket-cerrar {
      width: 100%;
      height: 2.8rem;
      background: #4f46e5;
      color: #ffffff;
      border: none;
      border-radius: 0.6rem;
      font-size: 0.92rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.18s ease;
    }

    .btn-ticket-cerrar:hover {
      background: #4338ca;
    }

    @media (max-width: 1024px) {
      .pos-grid {
        grid-template-columns: 1fr;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class RegistroVentasPageComponent implements OnInit {
  private readonly ventaService = inject(VentaService);
  private readonly productoService = inject(ProductoService);
  private readonly cajaService = inject(CajaService);
  private readonly router = inject(Router);

  // Signals de Estado
  readonly cajaActual = signal<CajaSesionDto | null>(null);
  readonly tieneCajaAbierta = signal<boolean>(false);
  readonly cargandoCaja = signal<boolean>(false);

  readonly productos = signal<ProductoDto[]>([]);
  readonly cargandoProductos = signal<boolean>(false);
  readonly filtroTexto = signal<string>('');

  readonly carrito = signal<ItemCarrito[]>([]);
  readonly procesandoVenta = signal<boolean>(false);
  readonly alerta = signal<{ tipo: 'exito' | 'error' | 'advertencia'; mensaje: string } | null>(null);
  readonly ticketVenta = signal<VentaDto | null>(null);

  // Signals Calculados (Computed)
  readonly totalVenta = computed(() => {
    return Number(this.carrito().reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
  });

  readonly totalArticulos = computed(() => {
    return this.carrito().reduce((sum, item) => sum + item.cantidad, 0);
  });

  ngOnInit(): void {
    this.cargarEstadoCaja();
    this.cargarProductos();
  }

  async cargarEstadoCaja(): Promise<void> {
    this.cargandoCaja.set(true);
    try {
      const resp = await firstValueFrom(this.cajaService.getEstadoActual());
      this.tieneCajaAbierta.set(resp?.tieneCajaAbierta ?? false);
      this.cajaActual.set(resp?.cajaActual ?? null);
    } catch (err) {
      console.error('Error al consultar estado de caja:', err);
      this.tieneCajaAbierta.set(false);
      this.cajaActual.set(null);
    } finally {
      this.cargandoCaja.set(false);
    }
  }

  async cargarProductos(search?: string): Promise<void> {
    this.cargandoProductos.set(true);
    try {
      const resp = await firstValueFrom(
        this.productoService.getProductos({
          search: search || undefined,
          isActive: true,
          pageSize: 40,
        })
      );
      this.productos.set(resp?.items ?? []);
    } catch (err) {
      console.error('Error al cargar catálogo de productos:', err);
      this.productos.set([]);
    } finally {
      this.cargandoProductos.set(false);
    }
  }

  buscarProductos(termino: string): void {
    this.filtroTexto.set(termino);
    this.cargarProductos(termino);
  }

  agregarAlCarrito(producto: ProductoDto): void {
    const stockDisponible = producto.stockActual ?? producto.stock ?? 0;
    if (stockDisponible <= 0) {
      this.alerta.set({
        tipo: 'advertencia',
        mensaje: `El producto "${producto.nombre}" está agotado en inventario.`,
      });
      return;
    }

    const items = [...this.carrito()];
    const indice = items.findIndex((i) => i.producto.id === producto.id);

    if (indice >= 0) {
      const itemExistente = items[indice];
      if (itemExistente.cantidad + 1 > stockDisponible) {
        this.alerta.set({
          tipo: 'advertencia',
          mensaje: `No puedes agregar más unidades de "${producto.nombre}". Stock disponible: ${stockDisponible}.`,
        });
        return;
      }

      const nuevaCantidad = itemExistente.cantidad + 1;
      items[indice] = {
        ...itemExistente,
        cantidad: nuevaCantidad,
        subtotal: Number((nuevaCantidad * itemExistente.precioUnitario).toFixed(2)),
      };
    } else {
      items.push({
        producto,
        cantidad: 1,
        precioUnitario: producto.precio,
        subtotal: Number(producto.precio.toFixed(2)),
      });
    }

    this.carrito.set(items);
    this.alerta.set(null);
  }

  cambiarCantidad(evento: { productoId: number; cantidad: number }): void {
    const items = [...this.carrito()];
    const indice = items.findIndex((i) => i.producto.id === evento.productoId);
    if (indice < 0) return;

    if (evento.cantidad <= 0) {
      this.eliminarItem(evento.productoId);
      return;
    }

    const stock = items[indice].producto.stockActual ?? items[indice].producto.stock ?? 9999;
    if (evento.cantidad > stock) {
      this.alerta.set({
        tipo: 'advertencia',
        mensaje: `Cantidad solicitada supera el stock disponible (${stock}).`,
      });
      return;
    }

    items[indice] = {
      ...items[indice],
      cantidad: evento.cantidad,
      subtotal: Number((evento.cantidad * items[indice].precioUnitario).toFixed(2)),
    };
    this.carrito.set(items);
  }

  eliminarItem(productoId: number): void {
    const items = this.carrito().filter((i) => i.producto.id !== productoId);
    this.carrito.set(items);
  }

  vaciarCarrito(): void {
    this.carrito.set([]);
    this.alerta.set(null);
  }

  async ejecutarConfirmacionVenta(): Promise<void> {
    if (!this.tieneCajaAbierta()) {
      this.alerta.set({
        tipo: 'advertencia',
        mensaje: 'No es posible registrar la venta sin un turno de caja abierto.',
      });
      return;
    }

    const items = this.carrito();
    if (items.length === 0) {
      this.alerta.set({
        tipo: 'advertencia',
        mensaje: 'El carrito está vacío. Agrega productos para procesar la venta.',
      });
      return;
    }

    this.procesandoVenta.set(true);
    this.alerta.set(null);

    const payload = {
      items: items.map((i) => ({
        idProducto: i.producto.id,
        cantidad: i.cantidad,
      })),
    };

    try {
      const ventaRealizada = await firstValueFrom(this.ventaService.registrarVenta(payload));

      this.ticketVenta.set(ventaRealizada);
      this.carrito.set([]);
      this.alerta.set({
        tipo: 'exito',
        mensaje: `¡Venta #${ventaRealizada.id} registrada exitosamente por Q${ventaRealizada.total.toFixed(2)}!`,
      });

      // Refrescar catálogo para actualizar el stock visible y estado de caja para ventas acumuladas
      await Promise.all([
        this.cargarProductos(this.filtroTexto()),
        this.cargarEstadoCaja(),
      ]);
    } catch (err: any) {
      console.error('Error al procesar venta:', err);

      // Manejo específico de HTTP 409 (Conflict - Stock Insuficiente o Concurrencia)
      if (err?.status === 409) {
        const detalle = err.error?.detail || err.error?.title || 'Stock insuficiente para uno o más productos.';
        this.alerta.set({
          tipo: 'error',
          mensaje: `Error de inventario (409 Conflict): ${detalle}`,
        });
      } else if (err?.status === 400) {
        const detalle = err.error?.detail || err.error?.title || 'Los datos de la venta son inválidos.';
        this.alerta.set({
          tipo: 'error',
          mensaje: `Solicitud inválida (400): ${detalle}`,
        });
      } else if (err?.status === 403) {
        this.alerta.set({
          tipo: 'error',
          mensaje: 'No tienes permisos para registrar ventas con tu rol actual.',
        });
      } else {
        this.alerta.set({
          tipo: 'error',
          mensaje: 'Ocurrió un error inesperado al procesar la venta. Inténtalo nuevamente.',
        });
      }
    } finally {
      this.procesandoVenta.set(false);
    }
  }

  navegarACaja(): void {
    this.router.navigate(['/caja']);
  }
}
