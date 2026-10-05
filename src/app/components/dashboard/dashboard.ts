import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../features/auth/services/auth.service';
import { ProductoService } from '../../services/producto.service';

interface BarraCategoria { nombre: string; stock: number; pct: number; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly authService = inject(AuthService);
  private readonly productoService = inject(ProductoService);

  readonly usuario    = this.authService.usuarioActual;
  readonly productos  = this.productoService.productosSignal;
  readonly fechaActual = new Date();

  /* ── KPIs ─────────────────────────────────────── */
  readonly totalProductos  = computed(() => this.productos().length);
  readonly disponibles     = computed(() => this.productos().filter(p => p.estado === 'disponible').length);
  readonly agotados        = computed(() => this.productos().filter(p => p.estado === 'agotado').length);
  readonly valorInventario = computed(() =>
    this.productos().reduce((acc, p) => acc + p.precio * p.stock, 0)
  );
  readonly stockTotal = computed(() =>
    this.productos().reduce((acc, p) => acc + p.stock, 0)
  );
  readonly alertaStock = computed(() =>
    this.productos().filter(p => p.stock > 0 && p.stock <= 5 && p.estado === 'disponible')
  );

  /* ── Gráfica 1: Stock por categoría (barras) ── */
  readonly barrasCategorias = computed<BarraCategoria[]>(() => {
    const map = new Map<string, number>();
    for (const p of this.productos()) {
      map.set(p.categoria, (map.get(p.categoria) ?? 0) + p.stock);
    }
    const maxStock = Math.max(...Array.from(map.values()), 1);
    return Array.from(map.entries())
      .map(([nombre, stock]) => ({ nombre, stock, pct: Math.round((stock / maxStock) * 100) }))
      .sort((a, b) => b.stock - a.stock);
  });

  /* ── Gráfica 2: Donut disponibles vs agotados ── */
  readonly donutDisponibles = computed(() => {
    const total = this.totalProductos();
    if (total === 0) return 0;
    return Math.round((this.disponibles() / total) * 100);
  });
  readonly donutAgotados = computed(() => 100 - this.donutDisponibles());

  /** Dash-array para el arco SVG del donut (circumference = 2π×40 ≈ 251) */
  readonly donutArcDisp = computed(() => `${(this.donutDisponibles() / 100) * 251} 251`);
  readonly donutArcAgot = computed(() => `${(this.donutAgotados()    / 100) * 251} 251`);
  readonly donutOffset  = computed(() => `${-(this.donutDisponibles() / 100) * 251}`);

  formatearMoneda(valor: number): string {
    return '$' + valor.toLocaleString('es-MX');
  }
}
