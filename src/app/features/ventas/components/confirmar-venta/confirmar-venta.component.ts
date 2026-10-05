import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CajaSesionDto } from '../../../caja/models/caja.model';

@Component({
  selector: 'app-confirmar-venta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pos-card confirmacion-panel">
      <!-- Semáforo / Estado de Caja -->
      <div class="caja-status-bar" [ngClass]="tieneCajaAbierta ? 'caja--abierta' : 'caja--cerrada'">
        <div class="caja-indicador">
          <span class="punto-estado"></span>
          <div>
            <p class="caja-estado-titulo">
              {{ tieneCajaAbierta ? 'Turno de Caja Abierto' : 'No hay turno de caja abierto' }}
            </p>
            @if (tieneCajaAbierta && cajaActual) {
              <p class="caja-estado-detalle">
                Cajero: <strong>{{ cajaActual.nombreUsuario }}</strong> · Turno #{{ cajaActual.id }}
              </p>
            } @else {
              <p class="caja-estado-detalle">
                Debes abrir la caja antes de registrar cobros
              </p>
            }
          </div>
        </div>

        @if (!tieneCajaAbierta) {
          <button type="button" class="btn-ir-caja" (click)="onIrACaja()">
            Abrir Caja
          </button>
        }
      </div>

      <!-- Calculadora de Cobro en Efectivo -->
      <div class="cobro-card">
        <h4 class="cobro-titulo">Procesar Cobro</h4>

        <div class="pago-input-group">
          <label class="pago-label" for="montoRecibido">Efectivo Recibido</label>
          <div class="input-money-wrap">
            <span class="currency-symbol">Q</span>
            <input
              id="montoRecibido"
              type="number"
              min="0"
              step="0.5"
              class="pago-input"
              placeholder="0.00"
              [(ngModel)]="montoRecibido"
              (ngModelChange)="calcularCambio()"
              [disabled]="totalArticulos === 0 || !tieneCajaAbierta || procesando"
            />
          </div>
        </div>

        <!-- Atajos de montos rápidos -->
        @if (total > 0 && tieneCajaAbierta) {
          <div class="atajos-wrap">
            <button type="button" class="btn-atajo" (click)="fijarMonto(total)">
              Exacto Q{{ total | number:'1.2-2' }}
            </button>
            <button type="button" class="btn-atajo" (click)="fijarMonto(obtenerSiguienteBillete(total, 50))">
              Q{{ obtenerSiguienteBillete(total, 50) }}
            </button>
            <button type="button" class="btn-atajo" (click)="fijarMonto(obtenerSiguienteBillete(total, 100))">
              Q{{ obtenerSiguienteBillete(total, 100) }}
            </button>
            <button type="button" class="btn-atajo" (click)="fijarMonto(obtenerSiguienteBillete(total, 200))">
              Q{{ obtenerSiguienteBillete(total, 200) }}
            </button>
          </div>
        }

        <!-- Cálculo de cambio / vuelto -->
        <div class="cambio-box" [ngClass]="obtenerClaseCambio()">
          <span class="cambio-label">
            {{ cambioCalculado >= 0 ? 'Cambio a Entregar' : 'Faltan' }}
          </span>
          <span class="cambio-valor">
            Q{{ (cambioCalculado >= 0 ? cambioCalculado : -cambioCalculado) | number:'1.2-2' }}
          </span>
        </div>
      </div>

      <!-- Botón de Confirmación Principal -->
      <div class="accion-footer">
        <button
          type="button"
          class="btn-confirmar-venta"
          [disabled]="!puedeRegistrar()"
          (click)="onConfirmar()"
        >
          @if (procesando) {
            <span class="spinner-sm"></span>
            <span>Procesando venta...</span>
          } @else {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Confirmar y Cobrar (Q{{ total | number:'1.2-2' }})</span>
          }
        </button>

        @if (!tieneCajaAbierta) {
          <p class="advertencia-texto">
            * Se requiere una sesión de caja activa para autorizar la transacción.
          </p>
        } @else if (totalArticulos === 0) {
          <p class="advertencia-texto">
            * Agrega productos al carrito para habilitar el cobro.
          </p>
        } @else if (montoRecibido !== null && montoRecibido < total) {
          <p class="advertencia-texto advertencia-texto--rojo">
            * El efectivo recibido no puede ser inferior al total a pagar.
          </p>
        }
      </div>
    </div>
  `,
  styles: [`
    .confirmacion-panel {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 0.85rem;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      padding: 1.25rem;
    }

    .caja-status-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 0.65rem;
      border: 1px solid transparent;
    }

    .caja--abierta {
      background: rgba(16, 185, 129, 0.08);
      border-color: rgba(16, 185, 129, 0.2);
    }

    .caja--cerrada {
      background: rgba(239, 68, 68, 0.08);
      border-color: rgba(239, 68, 68, 0.2);
    }

    .caja-indicador {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .punto-estado {
      width: 0.65rem;
      height: 0.65rem;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .caja--abierta .punto-estado {
      background: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
    }

    .caja--cerrada .punto-estado {
      background: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25);
    }

    .caja-estado-titulo {
      margin: 0;
      font-size: 0.85rem;
      font-weight: 700;
      color: #0f172a;
    }

    .caja-estado-detalle {
      margin: 0.1rem 0 0;
      font-size: 0.74rem;
      color: #64748b;
    }

    .btn-ir-caja {
      background: #ef4444;
      color: #ffffff;
      border: none;
      padding: 0.35rem 0.75rem;
      border-radius: 0.45rem;
      font-size: 0.76rem;
      font-weight: 700;
      cursor: pointer;
      flex-shrink: 0;
      transition: background 0.15s ease;
    }

    .btn-ir-caja:hover {
      background: #dc2626;
    }

    .cobro-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .cobro-titulo {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 700;
      color: #1e293b;
    }

    .pago-input-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .pago-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: #475569;
    }

    .input-money-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .currency-symbol {
      position: absolute;
      left: 1rem;
      font-size: 1.1rem;
      font-weight: 800;
      color: #64748b;
      pointer-events: none;
    }

    .pago-input {
      width: 100%;
      height: 2.8rem;
      padding: 0 1rem 0 2.4rem;
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      border-radius: 0.55rem;
      font-size: 1.2rem;
      font-weight: 800;
      color: #0f172a;
      transition: all 0.2s ease;
    }

    .pago-input:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
    }

    .pago-input:disabled {
      background: #f1f5f9;
      cursor: not-allowed;
      color: #94a3b8;
    }

    .atajos-wrap {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.4rem;
    }

    .btn-atajo {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 0.4rem;
      padding: 0.35rem 0.2rem;
      font-size: 0.72rem;
      font-weight: 700;
      color: #334155;
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: center;
    }

    .btn-atajo:hover {
      border-color: #4f46e5;
      color: #4f46e5;
      background: #eef2ff;
    }

    .cambio-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      border-radius: 0.55rem;
      border: 1px solid transparent;
      margin-top: 0.25rem;
    }

    .cambio-box--exacto {
      background: #f1f5f9;
      color: #475569;
    }

    .cambio-box--positivo {
      background: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.2);
    }

    .cambio-box--positivo .cambio-valor {
      color: #059669;
    }

    .cambio-box--faltante {
      background: rgba(245, 158, 11, 0.1);
      border-color: rgba(245, 158, 11, 0.2);
    }

    .cambio-box--faltante .cambio-valor {
      color: #d97706;
    }

    .cambio-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: #475569;
    }

    .cambio-valor {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    .accion-footer {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .btn-confirmar-venta {
      width: 100%;
      height: 3.2rem;
      background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
      color: #ffffff;
      border: none;
      border-radius: 0.75rem;
      font-size: 0.98rem;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.65rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
      transition: all 0.2s ease;
    }

    .btn-confirmar-venta svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    .btn-confirmar-venta:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(79, 70, 229, 0.35);
    }

    .btn-confirmar-venta:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }

    .advertencia-texto {
      margin: 0;
      font-size: 0.74rem;
      color: #94a3b8;
      text-align: center;
    }

    .advertencia-texto--rojo {
      color: #ef4444;
      font-weight: 600;
    }

    .spinner-sm {
      width: 1.1rem;
      height: 1.1rem;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ConfirmarVentaComponent {
  @Input() total: number = 0;
  @Input() totalArticulos: number = 0;
  @Input() tieneCajaAbierta: boolean = false;
  @Input() cajaActual: CajaSesionDto | null = null;
  @Input() procesando: boolean = false;

  @Output() confirmar = new EventEmitter<void>();
  @Output() irACaja = new EventEmitter<void>();

  montoRecibido: number | null = null;
  cambioCalculado: number = 0;

  fijarMonto(monto: number): void {
    this.montoRecibido = monto;
    this.calcularCambio();
  }

  calcularCambio(): void {
    if (this.montoRecibido === null || this.montoRecibido === undefined) {
      this.cambioCalculado = 0;
      return;
    }
    this.cambioCalculado = Number((this.montoRecibido - this.total).toFixed(2));
  }

  obtenerClaseCambio(): string {
    if (this.montoRecibido === null || this.montoRecibido === undefined || this.cambioCalculado === 0) {
      return 'cambio-box--exacto';
    }
    return this.cambioCalculado > 0 ? 'cambio-box--positivo' : 'cambio-box--faltante';
  }

  obtenerSiguienteBillete(total: number, billete: number): number {
    return Math.ceil(total / billete) * billete;
  }

  puedeRegistrar(): boolean {
    if (!this.tieneCajaAbierta || this.totalArticulos === 0 || this.procesando) {
      return false;
    }
    if (this.montoRecibido !== null && this.montoRecibido !== undefined) {
      return this.montoRecibido >= this.total;
    }
    return true;
  }

  onConfirmar(): void {
    if (this.puedeRegistrar()) {
      this.confirmar.emit();
    }
  }

  onIrACaja(): void {
    this.irACaja.emit();
  }
}
