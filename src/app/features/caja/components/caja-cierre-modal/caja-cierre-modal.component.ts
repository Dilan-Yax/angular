import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CajaSesionDto, CerrarCajaDto } from '../../models/caja.model';

@Component({
  selector: 'app-caja-cierre-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (visible && caja) {
      <div class="modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <div class="d-flex align-items-center gap-2">
              <div class="modal-icon-badge modal-icon-badge--rojo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <h4 class="modal-title">Cierre de Turno y Arqueo</h4>
                <p class="modal-subtitle">Conteo físico de efectivo y verificación de cuadre</p>
              </div>
            </div>
            <button type="button" class="btn-close-modal" (click)="onCancelar()" [disabled]="cargando">×</button>
          </div>

          <form (ngSubmit)="onConfirmar()">
            <div class="modal-body">
              <!-- Resumen Contable Teórico -->
              <div class="resumen-caja mb-3">
                <div class="resumen-item">
                  <span class="resumen-label">Fondo Inicial:</span>
                  <span class="resumen-valor">Q{{ caja.montoInicial | number:'1.2-2' }}</span>
                </div>
                <div class="resumen-item">
                  <span class="resumen-label">Ventas Efectivo:</span>
                  <span class="resumen-valor text-success">+ Q{{ caja.totalVentasEfectivo | number:'1.2-2' }}</span>
                </div>
                @if (caja.totalVentasOtrosMedios > 0) {
                  <div class="resumen-item">
                    <span class="resumen-label">Tarjetas / Otros:</span>
                    <span class="resumen-valor text-purple">Q{{ caja.totalVentasOtrosMedios | number:'1.2-2' }}</span>
                  </div>
                }
                <div class="resumen-item resumen-item--total">
                  <span class="resumen-label-destacada">Monto Esperado en Gaveta:</span>
                  <span class="resumen-valor-destacada">Q{{ caja.montoEsperado | number:'1.2-2' }}</span>
                </div>
              </div>

              <!-- Campo: Conteo Físico Real -->
              <div class="form-group mb-3">
                <label for="montoReal" class="form-label">
                  Monto Físico Contado (Efectivo Real) <span class="text-danger">*</span>
                </label>
                <div class="input-money-wrap">
                  <span class="currency-tag">Q</span>
                  <input
                    id="montoReal"
                    type="number"
                    min="0"
                    step="0.01"
                    class="form-control-custom"
                    placeholder="0.00"
                    [(ngModel)]="montoReal"
                    (ngModelChange)="calcularDiferencia()"
                    name="montoReal"
                    required
                    [disabled]="cargando"
                    autofocus
                  />
                </div>
              </div>

              <!-- Indicador de Arqueo en Tiempo Real -->
              <div class="diferencia-box mb-3" [ngClass]="obtenerClaseDiferencia()">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="diferencia-titulo">{{ obtenerTituloDiferencia() }}</span>
                    <p class="diferencia-desc mb-0">{{ obtenerDescripcionDiferencia() }}</p>
                  </div>
                  <span class="diferencia-monto">
                    {{ diferencia >= 0 ? '+' : '' }}Q{{ diferencia | number:'1.2-2' }}
                  </span>
                </div>
              </div>

              <!-- Campo: Observaciones de Arqueo -->
              <div class="form-group">
                <label for="observacionesCierre" class="form-label">Notas / Observaciones del Cierre</label>
                <textarea
                  id="observacionesCierre"
                  class="form-control-custom form-textarea"
                  rows="2"
                  placeholder="Justificación en caso de sobrante/faltante, retiro de efectivo, etc."
                  [(ngModel)]="observaciones"
                  name="observaciones"
                  [disabled]="cargando"
                ></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button
                type="button"
                class="btn-secundario"
                (click)="onCancelar()"
                [disabled]="cargando"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="btn-cerrar"
                [disabled]="cargando || montoReal === null || montoReal === undefined || montoReal < 0"
              >
                @if (cargando) {
                  <span class="spinner-sm"></span>
                  <span>Cerrando turno...</span>
                } @else {
                  <span>Confirmar Cierre de Caja</span>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(3px);
      z-index: 1050;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.25rem;
    }

    .modal-card {
      background: #ffffff;
      border-radius: 1rem;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .modal-icon-badge {
      width: 2.4rem;
      height: 2.4rem;
      border-radius: 0.6rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .modal-icon-badge svg {
      width: 1.2rem;
      height: 1.2rem;
    }

    .modal-icon-badge--rojo {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .modal-title {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
    }

    .modal-subtitle {
      margin: 0.1rem 0 0;
      font-size: 0.78rem;
      color: #64748b;
    }

    .btn-close-modal {
      background: transparent;
      border: none;
      font-size: 1.5rem;
      color: #94a3b8;
      cursor: pointer;
      line-height: 1;
      padding: 0.25rem;
    }

    .btn-close-modal:hover {
      color: #334155;
    }

    .modal-body {
      padding: 1.5rem;
      background: #ffffff;
    }

    .resumen-caja {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.65rem;
      padding: 0.85rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .resumen-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.84rem;
      color: #64748b;
    }

    .resumen-valor {
      font-weight: 700;
      color: #1e293b;
    }

    .text-purple {
      color: #a855f7;
    }

    .resumen-item--total {
      margin-top: 0.3rem;
      padding-top: 0.5rem;
      border-top: 1px dashed #cbd5e1;
    }

    .resumen-label-destacada {
      font-size: 0.88rem;
      font-weight: 800;
      color: #0f172a;
    }

    .resumen-valor-destacada {
      font-size: 1.15rem;
      font-weight: 800;
      color: #d97706;
    }

    .form-label {
      display: block;
      font-size: 0.82rem;
      font-weight: 700;
      color: #334155;
      margin-bottom: 0.4rem;
    }

    .input-money-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .currency-tag {
      position: absolute;
      left: 1rem;
      font-size: 1.15rem;
      font-weight: 800;
      color: #64748b;
      pointer-events: none;
    }

    .form-control-custom {
      width: 100%;
      height: 2.8rem;
      padding: 0 1rem 0 2.4rem;
      background: #f8fafc;
      border: 1.5px solid #cbd5e1;
      border-radius: 0.6rem;
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
      transition: all 0.2s ease;
    }

    .form-control-custom:focus {
      outline: none;
      background: #ffffff;
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
    }

    .form-textarea {
      height: auto;
      padding: 0.65rem 0.85rem;
      font-size: 0.85rem;
      font-weight: 400;
      resize: vertical;
    }

    .diferencia-box {
      padding: 0.85rem 1rem;
      border-radius: 0.6rem;
      border: 1px solid transparent;
    }

    .diferencia-box--cuadre {
      background: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.25);
      color: #065f46;
    }

    .diferencia-box--sobrante {
      background: rgba(99, 102, 241, 0.1);
      border-color: rgba(99, 102, 241, 0.25);
      color: #3730a3;
    }

    .diferencia-box--faltante {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.25);
      color: #991b1b;
    }

    .diferencia-titulo {
      display: block;
      font-size: 0.88rem;
      font-weight: 800;
    }

    .diferencia-desc {
      font-size: 0.74rem;
      opacity: 0.85;
    }

    .diferencia-monto {
      font-size: 1.25rem;
      font-weight: 800;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #f1f5f9;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      background: #f8fafc;
    }

    .btn-secundario {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #475569;
      padding: 0.55rem 1.1rem;
      border-radius: 0.55rem;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-secundario:hover:not(:disabled) {
      background: #f1f5f9;
      color: #1e293b;
    }

    .btn-cerrar {
      background: #ef4444;
      border: none;
      color: #ffffff;
      padding: 0.55rem 1.35rem;
      border-radius: 0.55rem;
      font-size: 0.85rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .btn-cerrar:hover:not(:disabled) {
      background: #dc2626;
    }

    .btn-cerrar:disabled, .btn-secundario:disabled {
      opacity: 0.5;
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

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class CajaCierreModalComponent {
  @Input() visible: boolean = false;
  @Input() caja: CajaSesionDto | null = null;
  @Input() cargando: boolean = false;

  @Output() confirmar = new EventEmitter<CerrarCajaDto>();
  @Output() cancelar = new EventEmitter<void>();

  montoReal: number | null = null;
  diferencia: number = 0;
  observaciones: string = '';

  calcularDiferencia(): void {
    if (!this.caja || this.montoReal === null || this.montoReal === undefined) {
      this.diferencia = 0;
      return;
    }
    this.diferencia = Number((this.montoReal - this.caja.montoEsperado).toFixed(2));
  }

  obtenerClaseDiferencia(): string {
    if (this.diferencia === 0) return 'diferencia-box--cuadre';
    return this.diferencia > 0 ? 'diferencia-box--sobrante' : 'diferencia-box--faltante';
  }

  obtenerTituloDiferencia(): string {
    if (this.diferencia === 0) return 'Cuadre Perfecto';
    return this.diferencia > 0 ? 'Sobrante en Caja' : 'Faltante en Caja';
  }

  obtenerDescripcionDiferencia(): string {
    if (this.diferencia === 0) return 'El dinero físico coincide con el monto esperado';
    return this.diferencia > 0
      ? 'Hay más dinero físico en gaveta del registrado'
      : 'Falta dinero físico respecto al monto registrado';
  }

  onConfirmar(): void {
    if (this.montoReal !== null && this.montoReal !== undefined && this.montoReal >= 0) {
      this.confirmar.emit({
        montoReal: Number(this.montoReal),
        observaciones: this.observaciones.trim() || undefined,
      });
    }
  }

  onCancelar(): void {
    this.cancelar.emit();
  }
}
