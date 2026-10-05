import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';
import { ProductoService } from '../../features/productos/services/producto.service';
import { ProductoDto } from '../../features/productos/models/producto.model';
import { CajaService } from '../../features/caja/services/caja.service';
import { EstadoCajaResponseDto } from '../../features/caja/models/caja.model';

interface BarraCategoria {
  nombre: string;
  stock: number;
  pct: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly productoService = inject(ProductoService);
  private readonly cajaService = inject(CajaService);

  readonly usuario = this.authService.usuarioActual;
  readonly fechaActual = new Date();

  // Signals reactivos con datos reales de la API
  readonly productos = signal<ProductoDto[]>([]);
  readonly productosReposicion = signal<ProductoDto[]>([]);
  readonly estadoCaja = signal<EstadoCajaResponseDto | null>(null);
  readonly cargando = signal<boolean>(false);

  /* ── KPIs Reactivos ────────────────────────────────────────── */
  readonly totalProductos = computed(() => this.productos().length);

  readonly disponibles = computed(() =>
    this.productos().filter((p) => this.obtenerStock(p) > 0).length
  );

  readonly agotados = computed(() =>
    this.productos().filter((p) => this.obtenerStock(p) <= 0).length
  );

  readonly valorInventario = computed(() =>
    this.productos().reduce(
      (acc, p) => acc + p.precio * this.obtenerStock(p),
      0
    )
  );

  readonly stockTotal = computed(() =>
    this.productos().reduce((acc, p) => acc + this.obtenerStock(p), 0)
  );

  // Alerta de reposición alimentada directamente por GET api/productos?SoloStockBajo=true
  readonly alertaStock = computed(() => this.productosReposicion());

  // KPI de Caja: Total de ventas en efectivo del turno activo
  readonly ventasEfectivoTurno = computed(
    () => this.estadoCaja()?.cajaActual?.totalVentasEfectivo ?? 0
  );

  readonly tieneCajaAbierta = computed(
    () => this.estadoCaja()?.tieneCajaAbierta ?? false
  );

  /* ── Gráfica 1: Stock por categoría (barras) ───────────────── */
  readonly barrasCategorias = computed<BarraCategoria[]>(() => {
    const map = new Map<string, number>();
    for (const p of this.productos()) {
      const cat = p.nombreCategoria || 'General';
      const stock = this.obtenerStock(p);
      map.set(cat, (map.get(cat) ?? 0) + stock);
    }
    const maxStock = Math.max(...Array.from(map.values()), 1);
    return Array.from(map.entries())
      .map(([nombre, stock]) => ({
        nombre,
        stock,
        pct: Math.round((stock / maxStock) * 100),
      }))
      .sort((a, b) => b.stock - a.stock);
  });

  /* ── Gráfica 2: Donut disponibles vs agotados ──────────────── */
  readonly donutDisponibles = computed(() => {
    const total = this.totalProductos();
    if (total === 0) return 0;
    return Math.round((this.disponibles() / total) * 100);
  });

  readonly donutAgotados = computed(() => 100 - this.donutDisponibles());

  /** Dash-array para el arco SVG del donut (circumference = 2π×40 ≈ 251) */
  readonly donutArcDisp = computed(
    () => `${(this.donutDisponibles() / 100) * 251} 251`
  );
  readonly donutArcAgot = computed(
    () => `${(this.donutAgotados() / 100) * 251} 251`
  );
  readonly donutOffset = computed(
    () => `${-(this.donutDisponibles() / 100) * 251}`
  );

  ngOnInit(): void {
    this.cargarDatos();
  }

  async cargarDatos(): Promise<void> {
    this.cargando.set(true);
    try {
      const [resProds, resStockBajo, resCaja] = await Promise.all([
        firstValueFrom(this.productoService.getProductos({ pageSize: 100 })),
        firstValueFrom(
          this.productoService.getProductos({ soloStockBajo: true, pageSize: 50 })
        ),
        firstValueFrom(this.cajaService.getEstadoActual()).catch(() => null),
      ]);

      this.productos.set(resProds?.items ?? []);
      this.productosReposicion.set(resStockBajo?.items ?? []);
      if (resCaja) {
        this.estadoCaja.set(resCaja);
      }
    } catch (err) {
      console.error('Error al cargar datos reales del dashboard:', err);
    } finally {
      this.cargando.set(false);
    }
  }

  obtenerStock(p: ProductoDto): number {
    return p.stockActual ?? p.stock ?? 0;
  }

  formatearMoneda(valor: number): string {
    return (
      'Q' +
      Number(valor || 0).toLocaleString('es-GT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }
}
