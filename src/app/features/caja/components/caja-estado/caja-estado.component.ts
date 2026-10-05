import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadoCajaResponseDto } from '../../models/caja.model';

@Component({
  selector: 'app-caja-estado',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- ══ Estado Sin Caja Abierta ════════════════════════════════════ -->
    @if (!estadoCaja?.tieneCajaAbierta && !cargando) {
      <div class="seccion text-center py-5">
        <div class="sin-caja-icono-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <circle cx="12" cy="12" r="2" />
            <path d="M6 12h.01M18 12h.01" />
          </svg>
        </div>
        <h3 class="sin-caja-titulo">No hay turno de caja abierto</h3>
        <p class="sin-caja-subtitulo">
          Para comenzar a registrar ventas y cobros en el sistema POS, debes realizar la apertura de caja con el fondo inicial.
        </p>
        <button
          type="button"
          class="btn-abrir-destacado"
          (click)="onAbrirTurno()"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Abrir Turno de Caja</span>
        </button>
      </div>
    }

    <!-- ══ Estado Con Caja Abierta: KPIs y Detalles ═════════════════════ -->
    @if (estadoCaja?.tieneCajaAbierta && estadoCaja?.cajaActual; as caja) {
      <!-- Panel de Identificación del Turno -->
      <div class="panel mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="caja-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <circle cx="12" cy="12" r="2" />
              <path d="M6 12h.01M18 12h.01" />
            </svg>
          </div>
          <div>
            <div class="d-flex align-items-center gap-2">
              <h3 class="panel__titulo mb-0">Turno de Caja Activo</h3>
              <span class="estado estado--ok">En Operación</span>
            </div>
            <p class="panel__subtitulo mb-0">
              Cajero Responsable: <strong>{{ caja.nombreUsuario }}</strong> · Turno #{{ caja.id }}
            </p>
          </div>
        </div>

        <div class="d-flex align-items-center gap-3">
          <div class="text-end d-none d-md-block">
            <span class="panel__fecha-dia">Apertura: {{ caja.fechaApertura | date:'shortTime' }}</span>
            <span class="panel__fecha-hora">{{ caja.fechaApertura | date:'mediumDate' }}</span>
          </div>
          <button
            type="button"
            class="btn-cerrar-turno"
            (click)="onCerrarTurno()"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Cerrar Turno / Arqueo</span>
          </button>
        </div>
      </div>

      <!-- Tarjetas KPI (Estética Dashboard) -->
      <div class="row g-3 mb-4">
        <!-- KPI 1: Fondo Inicial -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="kpi">
            <span class="kpi__icono kpi__icono--azul">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v12M8 10h8" />
              </svg>
            </span>
            <div>
              <p class="kpi__valor">Q{{ caja.montoInicial | number:'1.2-2' }}</p>
              <p class="kpi__etiqueta">Fondo Inicial</p>
            </div>
          </div>
        </div>

        <!-- KPI 2: Ventas en Efectivo -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="kpi">
            <span class="kpi__icono kpi__icono--verde">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </span>
            <div>
              <p class="kpi__valor kpi__valor--verde">Q{{ caja.totalVentasEfectivo | number:'1.2-2' }}</p>
              <p class="kpi__etiqueta">Ventas en Efectivo</p>
            </div>
          </div>
        </div>

        <!-- KPI 3: Otros Medios de Pago -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="kpi">
            <span class="kpi__icono kpi__icono--morado">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </span>
            <div>
              <p class="kpi__valor kpi__valor--morado">Q{{ caja.totalVentasOtrosMedios | number:'1.2-2' }}</p>
              <p class="kpi__etiqueta">Tarjetas / Otros</p>
            </div>
          </div>
        </div>

        <!-- KPI 4: Monto Teórico en Gaveta -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="kpi kpi--esperado">
            <span class="kpi__icono kpi__icono--naranja">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </span>
            <div>
              <p class="kpi__valor kpi__valor--naranja">Q{{ caja.montoEsperado | number:'1.2-2' }}</p>
              <p class="kpi__etiqueta">Esperado en Gaveta</p>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* ── Panel y KPIs basados en Dashboard ───────────────────────────────── */
    .panel {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.25rem 1.75rem;
      border-radius: 0.85rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    }

    .panel__titulo {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
    }

    .panel__subtitulo {
      color: #64748b;
      font-size: 0.85rem;
      margin-top: 0.2rem;
    }

    .panel__fecha-dia {
      display: block;
      font-size: 0.83rem;
      font-weight: 600;
      color: #334155;
    }

    .panel__fecha-hora {
      display: block;
      color: #94a3b8;
      font-size: 0.77rem;
    }

    .caja-avatar {
      width: 2.8rem;
      height: 2.8rem;
      border-radius: 0.75rem;
      background: rgba(16, 185, 129, 0.12);
      color: #10b981;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .caja-avatar svg {
      width: 1.4rem;
      height: 1.4rem;
    }

    .btn-cerrar-turno {
      background: #ef4444;
      color: #ffffff;
      border: none;
      padding: 0.65rem 1.25rem;
      border-radius: 0.6rem;
      font-size: 0.88rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
      transition: all 0.18s ease;
    }

    .btn-cerrar-turno svg {
      width: 1.1rem;
      height: 1.1rem;
    }

    .btn-cerrar-turno:hover {
      background: #dc2626;
      transform: translateY(-1px);
    }

    /* ── KPIs ─────────────────────────────────── */
    .kpi {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      padding: 1rem 1.2rem;
      border-radius: 0.85rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
      transition: transform 0.18s ease, box-shadow 0.18s ease;
    }

    .kpi:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(0,0,0,0.08);
    }

    .kpi--esperado {
      border-color: rgba(245, 158, 11, 0.3);
      background: #fffdfa;
    }

    .kpi__icono {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 2.6rem;
      height: 2.6rem;
      border-radius: 0.7rem;
    }

    .kpi__icono svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    .kpi__icono--azul   { background: rgba(99,102,241,0.1); color: #6366f1; }
    .kpi__icono--verde  { background: rgba(16,185,129,0.1); color: #10b981; }
    .kpi__icono--morado { background: rgba(168,85,247,0.1); color: #a855f7; }
    .kpi__icono--naranja{ background: rgba(245,158,11,0.12); color: #f59e0b; }

    .kpi__valor {
      margin-bottom: 0;
      font-size: 1.45rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1;
      color: #0f172a;
    }

    .kpi__valor--verde   { color: #10b981; }
    .kpi__valor--morado  { color: #a855f7; }
    .kpi__valor--naranja { color: #d97706; }

    .kpi__etiqueta {
      margin: 0.15rem 0 0;
      color: #64748b;
      font-size: 0.74rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
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

    /* ── Estado Sin Caja ───────────────────────────────── */
    .seccion {
      padding: 2.5rem 1.5rem;
      border-radius: 0.85rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .sin-caja-icono-wrap {
      width: 4rem;
      height: 4rem;
      border-radius: 1rem;
      background: rgba(245, 158, 11, 0.12);
      color: #d97706;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }

    .sin-caja-icono-wrap svg {
      width: 2rem;
      height: 2rem;
    }

    .sin-caja-titulo {
      margin: 0 0 0.5rem;
      font-size: 1.3rem;
      font-weight: 800;
      color: #0f172a;
    }

    .sin-caja-subtitulo {
      max-width: 520px;
      color: #64748b;
      font-size: 0.9rem;
      line-height: 1.5;
      margin-bottom: 1.5rem;
    }

    .btn-abrir-destacado {
      background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
      color: #ffffff;
      border: none;
      padding: 0.8rem 1.75rem;
      border-radius: 0.65rem;
      font-size: 0.95rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
      transition: all 0.18s ease;
    }

    .btn-abrir-destacado svg {
      width: 1.2rem;
      height: 1.2rem;
    }

    .btn-abrir-destacado:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
    }
  `]
})
export class CajaEstadoComponent {
  @Input() estadoCaja: EstadoCajaResponseDto | null = null;
  @Input() cargando: boolean = false;

  @Output() abrirTurno = new EventEmitter<void>();
  @Output() cerrarTurno = new EventEmitter<void>();

  onAbrirTurno(): void {
    this.abrirTurno.emit();
  }

  onCerrarTurno(): void {
    this.cerrarTurno.emit();
  }
}
