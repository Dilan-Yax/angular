import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { CajaService } from '../../services/caja.service';
import {
  AbrirCajaDto,
  CajaSesionDto,
  CerrarCajaDto,
  EstadoCajaResponseDto,
} from '../../models/caja.model';
import { CajaEstadoComponent } from '../caja-estado/caja-estado.component';
import { CajaAperturaModalComponent } from '../caja-apertura-modal/caja-apertura-modal.component';
import { CajaCierreModalComponent } from '../caja-cierre-modal/caja-cierre-modal.component';
import { CajaHistorialComponent } from '../caja-historial/caja-historial.component';

@Component({
  selector: 'app-caja-page',
  standalone: true,
  imports: [
    CommonModule,
    CajaEstadoComponent,
    CajaAperturaModalComponent,
    CajaCierreModalComponent,
    CajaHistorialComponent,
  ],
  template: `
    <div class="caja-page-layout">
      <!-- Encabezado del Módulo (Estética Dashboard) -->
      <div class="panel mb-4">
        <div>
          <h2 class="panel__titulo">Gestión de Turnos y Caja</h2>
          <p class="panel__subtitulo mb-0">
            Control de aperturas, arqueos físicos y cierres de sesión para cajeros
          </p>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button
            type="button"
            class="btn-refrescar"
            (click)="refrescarTodo()"
            [disabled]="cargando()"
            title="Actualizar datos"
          >
            <svg class="icon-sm" [class.animate-spin]="cargando()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      <!-- Alertas / Notificaciones -->
      @if (alerta()) {
        <div class="caja-alerta" [ngClass]="'caja-alerta--' + alerta()?.tipo">
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

      <!-- Componente Presentacional: Estado de Caja Activa / Sin Caja -->
      <app-caja-estado
        [estadoCaja]="estadoCaja()"
        [cargando]="cargando()"
        (abrirTurno)="abrirModalApertura()"
        (cerrarTurno)="abrirModalCierre()"
      />

      <!-- Componente Presentacional: Historial Reciente de Turnos -->
      <div class="mt-4">
        <app-caja-historial
          [historial]="historial()"
          [cargando]="cargandoHistorial()"
        />
      </div>

      <!-- Modales Presentacionales -->
      <app-caja-apertura-modal
        [visible]="modalAperturaVisible()"
        [cargando]="procesandoAccion()"
        (confirmar)="ejecutarAbrirCaja($event)"
        (cancelar)="modalAperturaVisible.set(false)"
      />

      <app-caja-cierre-modal
        [visible]="modalCierreVisible()"
        [caja]="estadoCaja()?.cajaActual || null"
        [cargando]="procesandoAccion()"
        (confirmar)="ejecutarCerrarCaja($event)"
        (cancelar)="modalCierreVisible.set(false)"
      />
    </div>
  `,
  styles: [`
    .caja-page-layout {
      display: flex;
      flex-direction: column;
      padding: 0.5rem 0;
    }

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
      margin: 0 0 0.2rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
    }

    .panel__subtitulo {
      color: #64748b;
      font-size: 0.86rem;
      margin: 0;
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

    .icon-sm {
      width: 1rem;
      height: 1rem;
    }

    .animate-spin {
      animation: spin 0.8s linear infinite;
    }

    .caja-alerta {
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

    .caja-alerta svg {
      width: 1.2rem;
      height: 1.2rem;
      flex-shrink: 0;
    }

    .caja-alerta--exito {
      background: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.25);
      color: #065f46;
    }

    .caja-alerta--error {
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

    .btn-cerrar-alerta:hover {
      opacity: 1;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class CajaPageComponent implements OnInit {
  private readonly cajaService = inject(CajaService);

  // Signals de Estado
  readonly estadoCaja = signal<EstadoCajaResponseDto | null>(null);
  readonly historial = signal<CajaSesionDto[]>([]);
  readonly cargando = signal<boolean>(false);
  readonly cargandoHistorial = signal<boolean>(false);
  readonly procesandoAccion = signal<boolean>(false);

  readonly modalAperturaVisible = signal<boolean>(false);
  readonly modalCierreVisible = signal<boolean>(false);
  readonly alerta = signal<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);

  ngOnInit(): void {
    this.refrescarTodo();
  }

  async refrescarTodo(): Promise<void> {
    await Promise.all([this.cargarEstado(), this.cargarHistorial()]);
  }

  async cargarEstado(): Promise<void> {
    this.cargando.set(true);
    try {
      const resp = await firstValueFrom(this.cajaService.getEstadoActual());
      this.estadoCaja.set(resp);
    } catch (err) {
      console.error('Error al cargar estado de caja:', err);
      this.alerta.set({
        tipo: 'error',
        mensaje: 'No fue posible consultar el estado actual del turno de caja.',
      });
    } finally {
      this.cargando.set(false);
    }
  }

  async cargarHistorial(): Promise<void> {
    this.cargandoHistorial.set(true);
    try {
      const resp = await firstValueFrom(this.cajaService.getHistorial({ page: 1, pageSize: 15 }));
      this.historial.set(resp?.items ?? []);
    } catch (err) {
      console.error('Error al cargar historial de caja:', err);
      this.historial.set([]);
    } finally {
      this.cargandoHistorial.set(false);
    }
  }

  abrirModalApertura(): void {
    this.alerta.set(null);
    this.modalAperturaVisible.set(true);
  }

  abrirModalCierre(): void {
    this.alerta.set(null);
    this.modalCierreVisible.set(true);
  }

  async ejecutarAbrirCaja(dto: AbrirCajaDto): Promise<void> {
    this.procesandoAccion.set(true);
    this.alerta.set(null);

    try {
      const nuevaSesion = await firstValueFrom(this.cajaService.abrirCaja(dto));
      this.modalAperturaVisible.set(false);
      this.alerta.set({
        tipo: 'exito',
        mensaje: `¡Turno #${nuevaSesion.id} abierto exitosamente con fondo inicial de Q${nuevaSesion.montoInicial.toFixed(2)}!`,
      });
      await this.refrescarTodo();
    } catch (err: any) {
      console.error('Error al abrir caja:', err);
      const detalle = err.error?.detail || err.error?.title || 'No se pudo abrir el turno de caja.';
      this.alerta.set({
        tipo: 'error',
        mensaje: `Error al abrir caja: ${detalle}`,
      });
    } finally {
      this.procesandoAccion.set(false);
    }
  }

  async ejecutarCerrarCaja(dto: CerrarCajaDto): Promise<void> {
    const caja = this.estadoCaja()?.cajaActual;
    if (!caja) return;

    this.procesandoAccion.set(true);
    this.alerta.set(null);

    try {
      const sesionCerrada = await firstValueFrom(this.cajaService.cerrarCaja(caja.id, dto));
      this.modalCierreVisible.set(false);

      const dif = sesionCerrada.diferencia ?? 0;
      const estadoDif = dif === 0 ? 'sin diferencias' : (dif > 0 ? `sobrante de Q${dif.toFixed(2)}` : `faltante de Q${Math.abs(dif).toFixed(2)}`);

      this.alerta.set({
        tipo: 'exito',
        mensaje: `¡Turno #${sesionCerrada.id} cerrado correctamente! Arqueo final: Q${sesionCerrada.montoReal?.toFixed(2)} (${estadoDif}).`,
      });
      await this.refrescarTodo();
    } catch (err: any) {
      console.error('Error al cerrar caja:', err);
      const detalle = err.error?.detail || err.error?.title || 'No se pudo cerrar el turno de caja.';
      this.alerta.set({
        tipo: 'error',
        mensaje: `Error al cerrar caja: ${detalle}`,
      });
    } finally {
      this.procesandoAccion.set(false);
    }
  }
}
