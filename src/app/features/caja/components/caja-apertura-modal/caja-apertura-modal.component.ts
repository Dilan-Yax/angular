import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AbrirCajaDto } from '../../models/caja.model';

@Component({
  selector: 'app-caja-apertura-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (visible) {
      <div class="modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <div class="d-flex align-items-center gap-2">
              <div class="modal-icon-badge modal-icon-badge--azul">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <circle cx="12" cy="12" r="2" />
                  <path d="M6 12h.01M18 12h.01" />
                </svg>
              </div>
              <div>
                <h4 class="modal-title">Apertura de Turno de Caja</h4>
                <p class="modal-subtitle">Ingresa el fondo inicial para habilitar cobros</p>
              </div>
            </div>
            <button type="button" class="btn-close-modal" (click)="onCancelar()" [disabled]="cargando">×</button>
          </div>

          <form (ngSubmit)="onConfirmar()">
            <div class="modal-body">
              <!-- Campo: Monto Inicial -->
              <div class="form-group mb-3">
                <label for="montoInicial" class="form-label">
                  Fondo Inicial de Caja (Efectivo) <span class="text-danger">*</span>
                </label>
                <div class="input-money-wrap">
                  <span class="currency-tag">Q</span>
                  <input
                    id="montoInicial"
                    type="number"
                    min="0"
                    step="0.01"
                    class="form-control-custom"
                    placeholder="0.00"
                    [(ngModel)]="montoInicial"
                    name="montoInicial"
                    required
                    [disabled]="cargando"
                    autofocus
                  />
                </div>
              </div>

              <!-- Atajos de montos -->
              <div class="mb-3">
                <span class="atajos-label">Montos sugeridos:</span>
                <div class="atajos-grid">
                  <button type="button" class="btn-atajo" (click)="fijarMonto(50)">Q50.00</button>
                  <button type="button" class="btn-atajo" (click)="fijarMonto(100)">Q100.00</button>
                  <button type="button" class="btn-atajo" (click)="fijarMonto(200)">Q200.00</button>
                  <button type="button" class="btn-atajo" (click)="fijarMonto(500)">Q500.00</button>
                </div>
              </div>

              <!-- Campo: Observaciones -->
              <div class="form-group">
                <label for="observaciones" class="form-label">Observaciones (Opcional)</label>
                <textarea
                  id="observaciones"
                  class="form-control-custom form-textarea"
                  rows="2"
                  placeholder="Detalles sobre billetes, denominaciones o notas de apertura..."
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
                class="btn-primario"
                [disabled]="cargando || montoInicial === null || montoInicial === undefined || montoInicial < 0"
              >
                @if (cargando) {
                  <span class="spinner-sm"></span>
                  <span>Abriendo caja...</span>
                } @else {
                  <span>Confirmar Apertura</span>
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
      max-width: 480px;
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

    .modal-icon-badge--azul {
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
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
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
    }

    .form-textarea {
      height: auto;
      padding: 0.65rem 0.85rem;
      font-size: 0.85rem;
      font-weight: 400;
      resize: vertical;
    }

    .atajos-label {
      display: block;
      font-size: 0.72rem;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 0.35rem;
    }

    .atajos-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.4rem;
    }

    .btn-atajo {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.45rem;
      padding: 0.35rem 0.2rem;
      font-size: 0.75rem;
      font-weight: 700;
      color: #475569;
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: center;
    }

    .btn-atajo:hover {
      background: #eef2ff;
      border-color: #6366f1;
      color: #4f46e5;
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

    .btn-primario {
      background: #4f46e5;
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

    .btn-primario:hover:not(:disabled) {
      background: #4338ca;
    }

    .btn-primario:disabled, .btn-secundario:disabled {
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
export class CajaAperturaModalComponent {
  @Input() visible: boolean = false;
  @Input() cargando: boolean = false;

  @Output() confirmar = new EventEmitter<AbrirCajaDto>();
  @Output() cancelar = new EventEmitter<void>();

  montoInicial: number | null = 100;
  observaciones: string = '';

  fijarMonto(monto: number): void {
    this.montoInicial = monto;
  }

  onConfirmar(): void {
    if (this.montoInicial !== null && this.montoInicial !== undefined && this.montoInicial >= 0) {
      this.confirmar.emit({
        montoInicial: Number(this.montoInicial),
        observaciones: this.observaciones.trim() || undefined,
      });
    }
  }

  onCancelar(): void {
    this.cancelar.emit();
  }
}
