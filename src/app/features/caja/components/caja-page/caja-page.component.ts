import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CajaService } from '../../services/caja.service';
import {
  AbrirCajaDto,
  CajaSesionDto,
  CerrarCajaDto,
  EstadoCajaResponseDto,
} from '../../models/caja.model';

@Component({
  selector: 'app-caja-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="caja-page-container">
      <!-- Encabezado del Módulo -->
      <header class="header-card">
        <div class="header-info">
          <div class="header-icon-wrapper">
            <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <circle cx="12" cy="12" r="2" />
              <path d="M6 12h.01M18 12h.01" />
            </svg>
          </div>
          <div>
            <h1 class="header-title">Gestión de Turnos y Caja</h1>
            <p class="header-subtitle">
              Control de apertura, arqueo y cierre diario de caja
            </p>
          </div>
        </div>

        <div class="header-actions">
          <button
            type="button"
            class="btn-refresh"
            (click)="cargarEstado()"
            [disabled]="cargando()"
            title="Actualizar datos">
            <svg class="icon-sm" [class.animate-spin]="cargando()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
            <span>Actualizar</span>
          </button>

          @if (!estadoCaja()?.tieneCajaAbierta && !cargando()) {
            <button
              type="button"
              class="btn-primary"
              (click)="abrirModalApertura()">
              <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Abrir Turno de Caja
            </button>
          } @else if (estadoCaja()?.tieneCajaAbierta) {
            <button
              type="button"
              class="btn-danger"
              (click)="abrirModalCierre()">
              <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Cerrar Turno / Arqueo
            </button>
          }
        </div>
      </header>

      <!-- Mensaje de Notificación / Alerta -->
      @if (mensajeAlerta()) {
        <div class="alert-box" [ngClass]="tipoAlerta()">
          <span>{{ mensajeAlerta() }}</span>
          <button type="button" class="alert-close" (click)="mensajeAlerta.set(null)">×</button>
        </div>
      }

      <!-- Loading State -->
      @if (cargando() && !estadoCaja()) {
        <div class="loading-card">
          <div class="spinner"></div>
          <p>Consultando estado de turno de caja...</p>
        </div>
      }

      <!-- Estado: Sin Caja Abierta -->
      @if (!cargando() && !estadoCaja()?.tieneCajaAbierta) {
        <div class="empty-state-card">
          <div class="empty-icon-container">
            <svg class="empty-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <circle cx="12" cy="12" r="2" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
          </div>
          <h2 class="empty-title">No hay ningún turno de caja abierto</h2>
          <p class="empty-desc">
            Actualmente no tienes un turno activo en el sistema. Para comenzar a realizar ventas y registrar cobros en efectivo, debes iniciar tu sesión con un monto de apertura.
          </p>
          <button
            type="button"
            class="btn-primary-large"
            (click)="abrirModalApertura()">
            <svg class="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Iniciar Turno de Caja
          </button>
        </div>
      }

      <!-- Estado: Caja Abierta / Turno Activo -->
      @if (estadoCaja()?.tieneCajaAbierta && estadoCaja()?.cajaActual; as caja) {
        <div class="active-shift-section">
          <!-- Banner de Turno Activo -->
          <div class="status-banner">
            <div class="status-pill">
              <span class="pulsing-dot"></span>
              <span>TURNO ACTIVO EN CURSO</span>
            </div>
            <div class="status-details">
              <span>Cajero: <strong>{{ caja.nombreUsuario }}</strong></span>
              <span class="divider">•</span>
              <span>Iniciado: <strong>{{ caja.fechaApertura | date:'medium' }}</strong></span>
            </div>
          </div>

          <!-- Cuadrícula de Métricas -->
          <div class="metrics-grid">
            <!-- Tarjeta 1: Fondo Inicial -->
            <div class="metric-card">
              <div class="metric-header">
                <span class="metric-title">Fondo Inicial</span>
                <span class="metric-badge bg-blue">Base</span>
              </div>
              <div class="metric-value">{{ caja.montoInicial | currency:'USD':'symbol':'1.2-2' }}</div>
              <p class="metric-footer">Efectivo de inicio de turno</p>
            </div>

            <!-- Tarjeta 2: Ventas en Efectivo -->
            <div class="metric-card">
              <div class="metric-header">
                <span class="metric-title">Ventas en Efectivo</span>
                <span class="metric-badge bg-emerald">Efectivo</span>
              </div>
              <div class="metric-value text-emerald">
                {{ caja.totalVentasEfectivo | currency:'USD':'symbol':'1.2-2' }}
              </div>
              <p class="metric-footer">Cobros acumulados en este turno</p>
            </div>

            <!-- Tarjeta 3: Otros Medios de Pago -->
            <div class="metric-card">
              <div class="metric-header">
                <span class="metric-title">Otros Medios</span>
                <span class="metric-badge bg-purple">Tarjetas / Transf.</span>
              </div>
              <div class="metric-value text-purple">
                {{ caja.totalVentasOtrosMedios | currency:'USD':'symbol':'1.2-2' }}
              </div>
              <p class="metric-footer">Ventas no computadas en efectivo</p>
            </div>

            <!-- Tarjeta 4: Total Esperado en Caja -->
            <div class="metric-card highlight-card">
              <div class="metric-header">
                <span class="metric-title text-indigo-700">Monto Esperado en Caja</span>
                <span class="metric-badge bg-indigo">Arqueo Teórico</span>
              </div>
              <div class="metric-value text-indigo">
                {{ caja.montoEsperado | currency:'USD':'symbol':'1.2-2' }}
              </div>
              <p class="metric-footer text-indigo-600">Fondo Inicial + Ventas Efectivo</p>
            </div>
          </div>

          <!-- Tarjeta de Información Adicional y Acciones Rápidas -->
          <div class="info-card">
            <div class="info-left">
              <h3 class="info-heading">Resumen de Operación</h3>
              <p class="info-text">
                El monto esperado se recalcula automáticamente conforme registras ventas en el sistema. Al finalizar tu jornada o relevo, realiza el conteo físico del efectivo en gaveta y pulsa <strong>Cerrar Turno / Arqueo</strong>.
              </p>
              @if (caja.observaciones) {
                <div class="notes-box">
                  <strong>Observación de apertura:</strong> {{ caja.observaciones }}
                </div>
              }
            </div>
            <div class="info-right">
              <button
                type="button"
                class="btn-danger-large"
                (click)="abrirModalCierre()">
                <svg class="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
                Proceder al Arqueo y Cierre
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL 1: APERTURA DE CAJA -->
      @if (modalAbrirVisible()) {
        <div class="modal-backdrop">
          <div class="modal-dialog">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge bg-blue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-sm">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <h3 class="modal-title">Apertura de Turno de Caja</h3>
              </div>
              <button type="button" class="modal-close" (click)="cerrarModalApertura()">×</button>
            </div>

            <form (submit)="ejecutarAbrirCaja($event)">
              <div class="modal-body">
                <p class="modal-hint">
                  Ingresa el monto de fondo inicial con el que comienzas tu turno (cambio/monedas en gaveta).
                </p>

                <div class="form-group">
                  <label for="montoInicial" class="form-label">
                    Monto Inicial en Efectivo *
                  </label>
                  <div class="input-currency-wrapper">
                    <span class="currency-symbol">$</span>
                    <input
                      id="montoInicial"
                      type="number"
                      step="0.01"
                      min="0"
                      class="form-input pl-currency"
                      placeholder="0.00"
                      [ngModel]="montoInicialInput()"
                      (ngModelChange)="montoInicialInput.set($event)"
                      name="montoInicial"
                      required
                      autofocus
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label for="observacionesApertura" class="form-label">
                    Observaciones (Opcional)
                  </label>
                  <textarea
                    id="observacionesApertura"
                    rows="3"
                    class="form-textarea"
                    placeholder="Ej. Billetes de baja denominación, turno matutino..."
                    [ngModel]="observacionesInput()"
                    (ngModelChange)="observacionesInput.set($event)"
                    name="observacionesApertura">
                  </textarea>
                </div>
              </div>

              <div class="modal-footer">
                <button
                  type="button"
                  class="btn-cancel"
                  (click)="cerrarModalApertura()"
                  [disabled]="guardando()">
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="btn-primary"
                  [disabled]="guardando() || (montoInicialInput() === null || montoInicialInput()! < 0)">
                  @if (guardando()) {
                    <span class="spinner-inline"></span>
                    <span>Abriendo...</span>
                  } @else {
                    <span>Confirmar Apertura</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL 2: CIERRE / ARQUEO DE CAJA -->
      @if (modalCerrarVisible()) {
        <div class="modal-backdrop">
          <div class="modal-dialog">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge bg-rose">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-sm">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h3 class="modal-title">Cierre y Arqueo de Turno</h3>
              </div>
              <button type="button" class="modal-close" (click)="cerrarModalCierre()">×</button>
            </div>

            <form (submit)="ejecutarCerrarCaja($event)">
              <div class="modal-body">
                <!-- Resumen previo al cierre -->
                @if (estadoCaja()?.cajaActual; as caja) {
                  <div class="summary-box">
                    <div class="summary-row">
                      <span>Fondo Inicial:</span>
                      <strong>{{ caja.montoInicial | currency:'USD':'symbol':'1.2-2' }}</strong>
                    </div>
                    <div class="summary-row">
                      <span>Ventas en Efectivo:</span>
                      <strong class="text-emerald">+ {{ caja.totalVentasEfectivo | currency:'USD':'symbol':'1.2-2' }}</strong>
                    </div>
                    <div class="summary-divider"></div>
                    <div class="summary-row highlight">
                      <span>Total Teórico Esperado:</span>
                      <strong class="text-indigo">{{ caja.montoEsperado | currency:'USD':'symbol':'1.2-2' }}</strong>
                    </div>
                  </div>
                }

                <div class="form-group mt-4">
                  <label for="montoReal" class="form-label">
                    Total Físico en Gaveta (Monto Real) *
                  </label>
                  <div class="input-currency-wrapper">
                    <span class="currency-symbol">$</span>
                    <input
                      id="montoReal"
                      type="number"
                      step="0.01"
                      min="0"
                      class="form-input pl-currency"
                      placeholder="0.00"
                      [ngModel]="montoRealInput()"
                      (ngModelChange)="montoRealInput.set($event)"
                      name="montoReal"
                      required
                      autofocus
                    />
                  </div>
                </div>

                <!-- Cálculo de Diferencia en tiempo real -->
                @if (montoRealInput() !== null) {
                  <div class="difference-card" [ngClass]="diferenciaClase()">
                    <div class="diff-icon-title">
                      @if (diferenciaCalculada() === 0) {
                        <span class="diff-tag tag-success">CUADRE EXACTO</span>
                      } @else if (diferenciaCalculada() > 0) {
                        <span class="diff-tag tag-info">SOBRANTE DE EFECTIVO</span>
                      } @else {
                        <span class="diff-tag tag-danger">FALTANTE DE EFECTIVO</span>
                      }
                    </div>
                    <div class="diff-amount">
                      {{ diferenciaCalculada() | currency:'USD':'symbol':'1.2-2' }}
                    </div>
                    <p class="diff-hint">
                      @if (diferenciaCalculada() === 0) {
                        El conteo físico coincide exactamente con las ventas registradas.
                      } @else if (diferenciaCalculada() > 0) {
                        Hay más efectivo en caja que el calculado por el sistema (+{{ diferenciaCalculada() | currency:'USD':'symbol':'1.2-2' }}).
                      } @else {
                        Hay menos efectivo en caja que el registrado por el sistema ({{ diferenciaCalculada() | currency:'USD':'symbol':'1.2-2' }}).
                      }
                    </p>
                  </div>
                }

                <div class="form-group mt-4">
                  <label for="observacionesCierre" class="form-label">
                    Notas / Justificación de Cuadre
                  </label>
                  <textarea
                    id="observacionesCierre"
                    rows="3"
                    class="form-textarea"
                    placeholder="Escribe comentarios sobre el cierre o justificación de diferencias..."
                    [ngModel]="observacionesInput()"
                    (ngModelChange)="observacionesInput.set($event)"
                    name="observacionesCierre">
                  </textarea>
                </div>
              </div>

              <div class="modal-footer">
                <button
                  type="button"
                  class="btn-cancel"
                  (click)="cerrarModalCierre()"
                  [disabled]="guardando()">
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="btn-danger"
                  [disabled]="guardando() || (montoRealInput() === null || montoRealInput()! < 0)">
                  @if (guardando()) {
                    <span class="spinner-inline"></span>
                    <span>Cerrando Caja...</span>
                  } @else {
                    <span>Finalizar y Cerrar Turno</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .caja-page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* ── Encabezado ────────────────────────────────────────── */
    .header-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      background: #ffffff;
      padding: 1.25rem 1.75rem;
      border-radius: 0.85rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    .header-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .header-icon-wrapper {
      width: 3rem;
      height: 3rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.75rem;
      background: rgba(99, 102, 241, 0.1);
      color: #4f46e5;
    }
    .header-icon {
      width: 1.75rem;
      height: 1.75rem;
    }
    .header-title {
      font-size: 1.35rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.01em;
    }
    .header-subtitle {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0.2rem 0 0;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    /* ── Botones ───────────────────────────────────────────── */
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.2rem;
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
    .btn-primary:hover:not(:disabled) {
      background: #4338ca;
      transform: translateY(-1px);
    }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-danger {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.2rem;
      background: #dc2626;
      color: #ffffff;
      font-size: 0.875rem;
      font-weight: 600;
      border: none;
      border-radius: 0.6rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
      transition: all 0.2s ease;
    }
    .btn-danger:hover:not(:disabled) {
      background: #b91c1c;
      transform: translateY(-1px);
    }
    .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-refresh {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.6rem 1rem;
      background: #f8fafc;
      color: #475569;
      font-size: 0.875rem;
      font-weight: 600;
      border: 1px solid #cbd5e1;
      border-radius: 0.6rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-refresh:hover:not(:disabled) {
      background: #f1f5f9;
      color: #1e293b;
    }
    .btn-cancel {
      padding: 0.6rem 1rem;
      background: #f1f5f9;
      color: #475569;
      font-size: 0.875rem;
      font-weight: 600;
      border: 1px solid #cbd5e1;
      border-radius: 0.6rem;
      cursor: pointer;
    }

    .btn-primary-large {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.85rem 1.75rem;
      background: #4f46e5;
      color: #ffffff;
      font-size: 1rem;
      font-weight: 600;
      border: none;
      border-radius: 0.75rem;
      cursor: pointer;
      box-shadow: 0 6px 18px rgba(79, 70, 229, 0.3);
      transition: all 0.2s ease;
    }
    .btn-primary-large:hover {
      background: #4338ca;
      transform: translateY(-2px);
    }

    .btn-danger-large {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.85rem 1.75rem;
      background: #dc2626;
      color: #ffffff;
      font-size: 0.95rem;
      font-weight: 600;
      border: none;
      border-radius: 0.75rem;
      cursor: pointer;
      box-shadow: 0 6px 18px rgba(220, 38, 38, 0.3);
      transition: all 0.2s ease;
    }
    .btn-danger-large:hover {
      background: #b91c1c;
      transform: translateY(-2px);
    }

    .icon-sm { width: 1.1rem; height: 1.1rem; }
    .icon-md { width: 1.35rem; height: 1.35rem; }

    /* ── Alertas ───────────────────────────────────────────── */
    .alert-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.85rem 1.25rem;
      border-radius: 0.65rem;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .alert-box.success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
    .alert-box.danger { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
    .alert-box.info { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; }
    .alert-close { background: transparent; border: none; font-size: 1.25rem; cursor: pointer; color: inherit; }

    /* ── Estado Vacío (Sin caja) ───────────────────────────── */
    .empty-state-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      padding: 4rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    .empty-icon-container {
      width: 4.5rem;
      height: 4.5rem;
      border-radius: 1rem;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      margin-bottom: 1.25rem;
    }
    .empty-svg { width: 2.5rem; height: 2.5rem; }
    .empty-title {
      font-size: 1.35rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.5rem;
    }
    .empty-desc {
      font-size: 0.95rem;
      color: #64748b;
      max-width: 550px;
      line-height: 1.6;
      margin: 0 0 1.75rem;
    }

    /* ── Caja Activa ───────────────────────────────────────── */
    .active-shift-section {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .status-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      padding: 0.85rem 1.5rem;
      border-radius: 0.75rem;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #065f46;
    }
    .pulsing-dot {
      width: 0.65rem;
      height: 0.65rem;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.35);
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
      70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
      100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }
    .status-details {
      font-size: 0.875rem;
      color: #047857;
    }
    .divider { margin: 0 0.5rem; color: #6ee7b7; }

    /* ── Tarjetas Métricas ─────────────────────────────────── */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 1.25rem;
    }
    .metric-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 0.85rem;
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .metric-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .metric-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: #64748b;
    }
    .metric-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .bg-blue { background: #e0e7ff; color: #4338ca; }
    .bg-emerald { background: #dcfce7; color: #15803d; }
    .bg-purple { background: #f3e8ff; color: #7e22ce; }
    .bg-indigo { background: #e0e7ff; color: #3730a3; }
    .bg-rose { background: #ffe4e6; color: #be123c; }

    .metric-value {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .text-emerald { color: #059669; }
    .text-purple { color: #9333ea; }
    .text-indigo { color: #4f46e5; }
    .metric-footer {
      font-size: 0.78rem;
      color: #94a3b8;
      margin: 0;
    }

    .highlight-card {
      background: #eef2ff;
      border-color: #c7d2fe;
    }

    /* ── Info Card ─────────────────────────────────────────── */
    .info-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 0.85rem;
      padding: 1.5rem 1.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      flex-wrap: wrap;
    }
    .info-left {
      flex: 1;
      min-width: 280px;
    }
    .info-heading {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.4rem;
    }
    .info-text {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
      line-height: 1.5;
    }
    .notes-box {
      margin-top: 0.75rem;
      padding: 0.5rem 0.85rem;
      background: #f8fafc;
      border-left: 3px solid #6366f1;
      font-size: 0.82rem;
      color: #475569;
      border-radius: 0 0.35rem 0.35rem 0;
    }
    .info-right {
      display: flex;
      align-items: center;
    }

    /* ── Loading Spinner ───────────────────────────────────── */
    .loading-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 0.85rem;
      padding: 4rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: #64748b;
    }
    .spinner {
      width: 2.2rem;
      height: 2.2rem;
      border: 3px solid #e2e8f0;
      border-top-color: #4f46e5;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .spinner-inline {
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-top-color: #ffffff;
      border-radius: 50%;
      display: inline-block;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Modales ───────────────────────────────────────────── */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(3px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
      padding: 1rem;
    }
    .modal-dialog {
      background: #ffffff;
      border-radius: 1rem;
      max-width: 520px;
      width: 100%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      overflow: hidden;
      animation: modalIn 0.2s ease-out;
    }
    @keyframes modalIn {
      from { transform: scale(0.96); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .modal-title-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .modal-icon-badge {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }
    .modal-close {
      background: transparent;
      border: none;
      font-size: 1.5rem;
      line-height: 1;
      color: #94a3b8;
      cursor: pointer;
    }
    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .modal-hint {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
      line-height: 1.45;
    }
    .modal-footer {
      padding: 1rem 1.5rem;
      background: #f8fafc;
      border-top: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    /* ── Formularios ───────────────────────────────────────── */
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .form-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #334155;
    }
    .input-currency-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .currency-symbol {
      position: absolute;
      left: 1rem;
      font-size: 1.1rem;
      font-weight: 700;
      color: #64748b;
      pointer-events: none;
    }
    .form-input {
      width: 100%;
      padding: 0.65rem 1rem;
      font-size: 1rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.6rem;
      outline: none;
      transition: all 0.15s ease;
    }
    .pl-currency { padding-left: 2.25rem; font-weight: 700; }
    .form-input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }
    .form-textarea {
      width: 100%;
      padding: 0.65rem 1rem;
      font-size: 0.875rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.6rem;
      outline: none;
      resize: vertical;
      font-family: inherit;
    }
    .form-textarea:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }

    /* ── Arqueo Resumen y Diferencia ───────────────────────── */
    .summary-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .summary-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.875rem;
      color: #475569;
    }
    .summary-row.highlight {
      font-size: 0.95rem;
      font-weight: 700;
      color: #1e293b;
    }
    .summary-divider {
      height: 1px;
      background: #e2e8f0;
      margin: 0.25rem 0;
    }

    .difference-card {
      border-radius: 0.75rem;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      text-align: center;
      transition: all 0.2s ease;
    }
    .diff-exact { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; }
    .diff-surplus { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; }
    .diff-shortage { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }

    .diff-tag {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      display: inline-block;
    }
    .tag-success { background: #dcfce7; color: #15803d; }
    .tag-info { background: #dbeafe; color: #1d4ed8; }
    .tag-danger { background: #fee2e2; color: #b91c1c; }

    .diff-amount {
      font-size: 1.6rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .diff-hint {
      font-size: 0.8rem;
      margin: 0;
      opacity: 0.85;
    }
    .mt-4 { margin-top: 1rem; }
  `]
})
export class CajaPageComponent implements OnInit {
  private readonly cajaService = inject(CajaService);

  // Signals requeridos por especificación
  estadoCaja = signal<EstadoCajaResponseDto | null>(null);
  cargando = signal<boolean>(false);
  modalAbrirVisible = signal<boolean>(false);
  modalCerrarVisible = signal<boolean>(false);
  montoInicialInput = signal<number | null>(null);
  montoRealInput = signal<number | null>(null);
  observacionesInput = signal<string>('');

  // Estados locales de feedback y guardado
  guardando = signal<boolean>(false);
  mensajeAlerta = signal<string | null>(null);
  tipoAlerta = signal<'success' | 'danger' | 'info'>('info');

  // Computed de diferencia en tiempo real
  diferenciaCalculada = computed(() => {
    const caja = this.estadoCaja()?.cajaActual;
    const real = this.montoRealInput();
    if (!caja || real === null || real === undefined) return 0;
    return Number((real - caja.montoEsperado).toFixed(2));
  });

  // Estilo visual de la diferencia
  diferenciaClase = computed(() => {
    const diff = this.diferenciaCalculada();
    if (diff === 0) return 'diff-exact';
    if (diff > 0) return 'diff-surplus';
    return 'diff-shortage';
  });

  ngOnInit(): void {
    this.cargarEstado();
  }

  cargarEstado(): void {
    this.cargando.set(true);
    this.cajaService.getEstadoActual().subscribe({
      next: (estado) => {
        this.estadoCaja.set(estado);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al consultar estado de caja:', err);
        this.cargando.set(false);
        this.mostrarAlerta(
          err?.error?.detail ?? 'No se pudo obtener el estado de la caja.',
          'danger'
        );
      },
    });
  }

  abrirModalApertura(): void {
    this.montoInicialInput.set(0);
    this.observacionesInput.set('');
    this.modalAbrirVisible.set(true);
  }

  cerrarModalApertura(): void {
    this.modalAbrirVisible.set(false);
    this.montoInicialInput.set(null);
    this.observacionesInput.set('');
  }

  abrirModalCierre(): void {
    const caja = this.estadoCaja()?.cajaActual;
    // Sugerir el monto esperado como valor inicial para agilizar si el cuadre es exacto
    this.montoRealInput.set(caja ? caja.montoEsperado : 0);
    this.observacionesInput.set('');
    this.modalCerrarVisible.set(true);
  }

  cerrarModalCierre(): void {
    this.modalCerrarVisible.set(false);
    this.montoRealInput.set(null);
    this.observacionesInput.set('');
  }

  ejecutarAbrirCaja(event?: Event): void {
    if (event) event.preventDefault();

    const monto = this.montoInicialInput();
    if (monto === null || monto === undefined || monto < 0) {
      this.mostrarAlerta('Ingresa un monto inicial válido mayor o igual a cero.', 'danger');
      return;
    }

    this.guardando.set(true);
    const dto: AbrirCajaDto = {
      montoInicial: Number(monto),
      observaciones: this.observacionesInput().trim() || undefined,
    };

    this.cajaService.abrirCaja(dto).subscribe({
      next: (cajaCreada) => {
        this.guardando.set(false);
        this.cerrarModalApertura();
        this.mostrarAlerta(
          `¡Turno de caja iniciado exitosamente con un fondo de $${cajaCreada.montoInicial.toFixed(2)}!`,
          'success'
        );
        this.cargarEstado();
      },
      error: (err) => {
        this.guardando.set(false);
        console.error('Error al abrir caja:', err);
        this.mostrarAlerta(
          err?.error?.detail ?? err?.error?.message ?? 'No se pudo abrir la caja.',
          'danger'
        );
      },
    });
  }

  ejecutarCerrarCaja(event?: Event): void {
    if (event) event.preventDefault();

    const caja = this.estadoCaja()?.cajaActual;
    if (!caja) return;

    const montoReal = this.montoRealInput();
    if (montoReal === null || montoReal === undefined || montoReal < 0) {
      this.mostrarAlerta('Ingresa el monto real en efectivo presente en caja.', 'danger');
      return;
    }

    this.guardando.set(true);
    const dto: CerrarCajaDto = {
      montoReal: Number(montoReal),
      observaciones: this.observacionesInput().trim() || undefined,
    };

    this.cajaService.cerrarCaja(caja.id, dto).subscribe({
      next: (cajaCerrada) => {
        this.guardando.set(false);
        this.cerrarModalCierre();
        const diff = cajaCerrada.diferencia ?? 0;
        const msgDiff =
          diff === 0
            ? 'Cuadre exacto.'
            : diff > 0
            ? `Sobrante de +$${diff.toFixed(2)}.`
            : `Faltante de -$${Math.abs(diff).toFixed(2)}.`;

        this.mostrarAlerta(
          `¡Turno de caja cerrado correctamente! ${msgDiff}`,
          diff === 0 ? 'success' : 'info'
        );
        this.cargarEstado();
      },
      error: (err) => {
        this.guardando.set(false);
        console.error('Error al cerrar caja:', err);
        this.mostrarAlerta(
          err?.error?.detail ?? err?.error?.message ?? 'No se pudo cerrar la caja.',
          'danger'
        );
      },
    });
  }

  private mostrarAlerta(mensaje: string, tipo: 'success' | 'danger' | 'info'): void {
    this.mensajeAlerta.set(mensaje);
    this.tipoAlerta.set(tipo);
    setTimeout(() => {
      if (this.mensajeAlerta() === mensaje) {
        this.mensajeAlerta.set(null);
      }
    }, 6000);
  }
}
