import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ReporteService } from '../../services/reporte.service';
import { FormatoReporte } from '../../models/reporte.model';

@Component({
  selector: 'app-reportes-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reportes-layout">
      <!-- Encabezado -->
      <div class="panel-header mb-4">
        <div>
          <h2 class="panel-titulo">Reportes Financieros</h2>
          <p class="panel-subtitulo">
            Generación y exportación de datos de ventas y sesiones de caja
            <span class="badge-modulo">Módulo Administrativo</span>
          </p>
        </div>
        <div class="text-end">
          <span class="panel-meta">Exportación hasta 10,000 registros</span>
          <span class="panel-submeta">Formatos compatibles con Excel y BI</span>
        </div>
      </div>

      <!-- Alertas -->
      @if (alerta()) {
        <div class="alerta-box" [ngClass]="'alerta-box--' + alerta()?.tipo">
          <div class="d-flex align-items-center gap-2">
            @if (alerta()?.tipo === 'exito') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
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

      <!-- Panel de Rango de Fechas Global -->
      <div class="filtros-card mb-4">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-4">
            <label class="form-sublabel">Rango Rápido</label>
            <div class="d-flex gap-1 flex-wrap">
              <button
                type="button"
                class="btn-atajo"
                (click)="aplicarAtajo('hoy')"
              >
                Hoy
              </button>
              <button
                type="button"
                class="btn-atajo"
                (click)="aplicarAtajo('semana')"
              >
                Últimos 7 días
              </button>
              <button
                type="button"
                class="btn-atajo"
                (click)="aplicarAtajo('mes')"
              >
                Este mes
              </button>
              <button
                type="button"
                class="btn-atajo"
                (click)="aplicarAtajo('todos')"
              >
                Historial completo
              </button>
            </div>
          </div>

          <div class="col-6 col-md-3">
            <label class="form-sublabel">Fecha Desde</label>
            <input
              type="date"
              class="form-control-custom"
              [(ngModel)]="fechaDesde"
            />
          </div>

          <div class="col-6 col-md-3">
            <label class="form-sublabel">Fecha Hasta</label>
            <input
              type="date"
              class="form-control-custom"
              [(ngModel)]="fechaHasta"
            />
          </div>

          <div class="col-12 col-md-2 d-flex align-items-end justify-content-end">
            <button
              type="button"
              class="btn-limpiar"
              (click)="limpiarFechas()"
              title="Restablecer fechas"
            >
              Limpiar Fechas
            </button>
          </div>
        </div>
      </div>

      <!-- Tarjetas de Reportes -->
      <div class="row g-4">
        <!-- 1. Reporte de Ventas -->
        <div class="col-12 col-lg-6">
          <div class="reporte-card">
            <div class="reporte-card__header">
              <div class="reporte-card__icono reporte-card__icono--indigo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"></path>
                </svg>
              </div>
              <div>
                <span class="reporte-card__tag">Operaciones POS</span>
                <h3 class="reporte-card__titulo">Reporte de Ventas</h3>
                <p class="reporte-card__subtitulo">
                  Histórico de órdenes facturadas en el punto de venta
                </p>
              </div>
            </div>

            <div class="reporte-card__body">
              <p class="reporte-card__desc">
                Genera un consolidado de tickets con detalle de ID de transacción, identificador de cajero, fecha y hora UTC, total de artículos vendidos, monto total de venta y estado.
              </p>

              <div class="reporte-card__items">
                <div class="reporte-item-pill">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Folios e importes liquidados</span>
                </div>
                <div class="reporte-item-pill">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Conteo de artículos por orden</span>
                </div>
                <div class="reporte-item-pill">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Identificación de cajero emisor</span>
                </div>
              </div>
            </div>

            <div class="reporte-card__footer">
              <button
                type="button"
                class="btn-export btn-export--excel"
                (click)="exportarVentas('excel')"
                [disabled]="cargandoVentas()"
              >
                @if (cargandoVentas() && formatoActualVentas() === 'excel') {
                  <span class="spinner-sm"></span>
                  <span>Generando Excel...</span>
                } @else {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="8" y1="13" x2="16" y2="13"></line>
                    <line x1="8" y1="17" x2="16" y2="17"></line>
                  </svg>
                  <span>Exportar Excel (.xlsx)</span>
                }
              </button>

              <button
                type="button"
                class="btn-export btn-export--csv"
                (click)="exportarVentas('csv')"
                [disabled]="cargandoVentas()"
              >
                @if (cargandoVentas() && formatoActualVentas() === 'csv') {
                  <span class="spinner-sm"></span>
                  <span>Generando CSV...</span>
                } @else {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Exportar CSV</span>
                }
              </button>
            </div>
          </div>
        </div>

        <!-- 2. Reporte de Sesiones de Caja -->
        <div class="col-12 col-lg-6">
          <div class="reporte-card">
            <div class="reporte-card__header">
              <div class="reporte-card__icono reporte-card__icono--emerald">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                  <circle cx="12" cy="12" r="2"></circle>
                  <path d="M6 12h.01M18 12h.01"></path>
                </svg>
              </div>
              <div>
                <span class="reporte-card__tag">Control de Efectivo</span>
                <h3 class="reporte-card__titulo">Reporte de Cajas</h3>
                <p class="reporte-card__subtitulo">
                  Auditoría de turnos, arqueos y cuadres de gaveta
                </p>
              </div>
            </div>

            <div class="reporte-card__body">
              <p class="reporte-card__desc">
                Desglose detallado de aperturas y cierres de turno: fondo inicial, ventas acumuladas en efectivo y otros medios, monto esperado, arqueo real, cálculo de sobrante/faltante y notas.
              </p>

              <div class="reporte-card__items">
                <div class="reporte-item-pill">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Fondo inicial vs esperado en gaveta</span>
                </div>
                <div class="reporte-item-pill">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Cálculo automático de diferencias</span>
                </div>
                <div class="reporte-item-pill">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Horas exactas de apertura y cierre</span>
                </div>
              </div>
            </div>

            <div class="reporte-card__footer">
              <button
                type="button"
                class="btn-export btn-export--excel"
                (click)="exportarCajas('excel')"
                [disabled]="cargandoCajas()"
              >
                @if (cargandoCajas() && formatoActualCajas() === 'excel') {
                  <span class="spinner-sm"></span>
                  <span>Generando Excel...</span>
                } @else {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="8" y1="13" x2="16" y2="13"></line>
                    <line x1="8" y1="17" x2="16" y2="17"></line>
                  </svg>
                  <span>Exportar Excel (.xlsx)</span>
                }
              </button>

              <button
                type="button"
                class="btn-export btn-export--csv"
                (click)="exportarCajas('csv')"
                [disabled]="cargandoCajas()"
              >
                @if (cargandoCajas() && formatoActualCajas() === 'csv') {
                  <span class="spinner-sm"></span>
                  <span>Generando CSV...</span>
                } @else {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Exportar CSV</span>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reportes-layout {
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

    .badge-modulo {
      display: inline-block;
      padding: 0.15rem 0.6rem;
      border-radius: 9999px;
      background: rgba(99, 102, 241, 0.1);
      color: #4f46e5;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .panel-meta {
      display: block;
      font-size: 0.82rem;
      font-weight: 700;
      color: #334155;
    }

    .panel-submeta {
      display: block;
      font-size: 0.74rem;
      color: #94a3b8;
    }

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
      margin-bottom: 0.35rem;
    }

    .btn-atajo {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      color: #334155;
      padding: 0.35rem 0.65rem;
      border-radius: 0.45rem;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-atajo:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .form-control-custom {
      width: 100%;
      height: 2.25rem;
      padding: 0 0.75rem;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 0.5rem;
      font-size: 0.82rem;
      color: #1e293b;
      transition: all 0.15s ease;
    }

    .form-control-custom:focus {
      outline: none;
      background: #ffffff;
      border-color: #6366f1;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
    }

    .btn-limpiar {
      background: transparent;
      border: none;
      color: #64748b;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0.4rem 0.6rem;
      border-radius: 0.4rem;
      transition: all 0.15s ease;
    }

    .btn-limpiar:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    /* Tarjetas de Reporte */
    .reporte-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 0.95rem;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .reporte-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }

    .reporte-card__header {
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      border-bottom: 1px solid #f8fafc;
    }

    .reporte-card__icono {
      width: 3rem;
      height: 3rem;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .reporte-card__icono svg {
      width: 1.5rem;
      height: 1.5rem;
    }

    .reporte-card__icono--indigo {
      background: rgba(99, 102, 241, 0.1);
      color: #4f46e5;
    }

    .reporte-card__icono--emerald {
      background: rgba(16, 185, 129, 0.1);
      color: #059669;
    }

    .reporte-card__tag {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #94a3b8;
    }

    .reporte-card__titulo {
      margin: 0.1rem 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
    }

    .reporte-card__subtitulo {
      margin: 0;
      font-size: 0.8rem;
      color: #64748b;
    }

    .reporte-card__body {
      padding: 1.25rem 1.5rem;
      flex: 1;
    }

    .reporte-card__desc {
      font-size: 0.84rem;
      color: #475569;
      line-height: 1.45;
      margin-bottom: 1rem;
    }

    .reporte-card__items {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .reporte-item-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.78rem;
      color: #334155;
      font-weight: 500;
    }

    .reporte-item-pill svg {
      width: 0.95rem;
      height: 0.95rem;
      color: #10b981;
      flex-shrink: 0;
    }

    .reporte-card__footer {
      padding: 1rem 1.5rem;
      background: #f8fafc;
      border-top: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .btn-export {
      flex: 1;
      height: 2.45rem;
      padding: 0 1rem;
      border-radius: 0.5rem;
      font-size: 0.82rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      cursor: pointer;
      transition: all 0.15s ease;
      border: none;
      white-space: nowrap;
    }

    .btn-export svg {
      width: 1rem;
      height: 1rem;
    }

    .btn-export--excel {
      background: #059669;
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(5, 150, 105, 0.2);
    }

    .btn-export--excel:hover:not(:disabled) {
      background: #047857;
    }

    .btn-export--csv {
      background: #ffffff;
      color: #334155;
      border: 1px solid #cbd5e1;
    }

    .btn-export--csv:hover:not(:disabled) {
      background: #f1f5f9;
      color: #0f172a;
    }

    .btn-export:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner-sm {
      width: 0.95rem;
      height: 0.95rem;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .btn-export--csv .spinner-sm {
      border: 2px solid rgba(51, 65, 85, 0.2);
      border-top-color: #334155;
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
export class ReportesPageComponent {
  private readonly reporteService = inject(ReporteService);

  fechaDesde: string = '';
  fechaHasta: string = '';

  readonly cargandoVentas = signal<boolean>(false);
  readonly formatoActualVentas = signal<FormatoReporte>('excel');

  readonly cargandoCajas = signal<boolean>(false);
  readonly formatoActualCajas = signal<FormatoReporte>('excel');

  readonly alerta = signal<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);

  aplicarAtajo(tipo: 'hoy' | 'semana' | 'mes' | 'todos'): void {
    const ahora = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const toYmd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (tipo === 'hoy') {
      this.fechaDesde = toYmd(ahora);
      this.fechaHasta = toYmd(ahora);
    } else if (tipo === 'semana') {
      const sieteDiasAtras = new Date();
      sieteDiasAtras.setDate(ahora.getDate() - 7);
      this.fechaDesde = toYmd(sieteDiasAtras);
      this.fechaHasta = toYmd(ahora);
    } else if (tipo === 'mes') {
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      this.fechaDesde = toYmd(inicioMes);
      this.fechaHasta = toYmd(ahora);
    } else if (tipo === 'todos') {
      this.fechaDesde = '';
      this.fechaHasta = '';
    }
  }

  limpiarFechas(): void {
    this.fechaDesde = '';
    this.fechaHasta = '';
  }

  async exportarVentas(formato: FormatoReporte): Promise<void> {
    this.cargandoVentas.set(true);
    this.formatoActualVentas.set(formato);
    this.alerta.set(null);

    try {
      await firstValueFrom(
        this.reporteService.descargarReporteVentas({
          formato,
          desde: this.fechaDesde || undefined,
          hasta: this.fechaHasta || undefined,
        })
      );
      this.alerta.set({
        tipo: 'exito',
        mensaje: `Reporte de ventas descargado exitosamente en formato ${formato.toUpperCase()}.`,
      });
    } catch (err: any) {
      console.error('Error al descargar reporte de ventas:', err);
      this.alerta.set({
        tipo: 'error',
        mensaje:
          err.status === 403
            ? 'Acceso denegado: Se requiere rol de Administrador para exportar reportes.'
            : 'No fue posible generar el reporte de ventas.',
      });
    } finally {
      this.cargandoVentas.set(false);
    }
  }

  async exportarCajas(formato: FormatoReporte): Promise<void> {
    this.cargandoCajas.set(true);
    this.formatoActualCajas.set(formato);
    this.alerta.set(null);

    try {
      await firstValueFrom(
        this.reporteService.descargarReporteCajas({
          formato,
          desde: this.fechaDesde || undefined,
          hasta: this.fechaHasta || undefined,
        })
      );
      this.alerta.set({
        tipo: 'exito',
        mensaje: `Reporte de sesiones de caja descargado exitosamente en formato ${formato.toUpperCase()}.`,
      });
    } catch (err: any) {
      console.error('Error al descargar reporte de cajas:', err);
      this.alerta.set({
        tipo: 'error',
        mensaje:
          err.status === 403
            ? 'Acceso denegado: Se requiere rol de Administrador para exportar reportes.'
            : 'No fue posible generar el reporte de sesiones de caja.',
      });
    } finally {
      this.cargandoCajas.set(false);
    }
  }
}
