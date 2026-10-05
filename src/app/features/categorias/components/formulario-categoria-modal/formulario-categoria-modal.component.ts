import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrearCategoriaDto } from '../../models/categoria.model';

@Component({
  selector: 'app-formulario-categoria-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (visible) {
      <div class="modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <div class="d-flex align-items-center gap-2">
              <div class="modal-icon-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <div>
                <h4 class="modal-title">Nueva Categoría</h4>
                <p class="modal-subtitle">Organiza los productos de tu inventario</p>
              </div>
            </div>
            <button type="button" class="btn-close-modal" (click)="onCancelar()" [disabled]="guardando">×</button>
          </div>

          <form (ngSubmit)="onGuardar()">
            <div class="modal-body">
              <div class="form-group mb-3">
                <label for="catNombre" class="form-label">
                  Nombre de la Categoría <span class="text-danger">*</span>
                </label>
                <input
                  id="catNombre"
                  type="text"
                  class="form-control-custom"
                  placeholder="Ej: Bebidas, Lácteos, Limpieza..."
                  [(ngModel)]="nombre"
                  name="nombre"
                  required
                  [disabled]="guardando"
                  autofocus
                />
              </div>

              <div class="form-group">
                <label for="catDesc" class="form-label">Descripción (Opcional)</label>
                <textarea
                  id="catDesc"
                  class="form-control-custom form-textarea"
                  rows="3"
                  placeholder="Breve detalle sobre los productos agrupados..."
                  [(ngModel)]="descripcion"
                  name="descripcion"
                  [disabled]="guardando"
                ></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button
                type="button"
                class="btn-secundario"
                (click)="onCancelar()"
                [disabled]="guardando"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="btn-primario"
                [disabled]="guardando || !nombre.trim()"
              >
                @if (guardando) {
                  <span class="spinner-sm"></span>
                  <span>Guardando...</span>
                } @else {
                  <span>Crear Categoría</span>
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
      max-width: 460px;
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
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .modal-icon-badge svg {
      width: 1.2rem;
      height: 1.2rem;
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

    .form-control-custom {
      width: 100%;
      height: 2.6rem;
      padding: 0 0.85rem;
      background: #f8fafc;
      border: 1.5px solid #cbd5e1;
      border-radius: 0.55rem;
      font-size: 0.9rem;
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
      resize: vertical;
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
export class FormularioCategoriaModalComponent {
  @Input() visible: boolean = false;
  @Input() guardando: boolean = false;

  @Output() guardar = new EventEmitter<CrearCategoriaDto>();
  @Output() cancelar = new EventEmitter<void>();

  nombre: string = '';
  descripcion: string = '';

  onGuardar(): void {
    if (this.nombre.trim()) {
      this.guardar.emit({
        nombre: this.nombre.trim(),
        descripcion: this.descripcion.trim() || null,
      });
      this.nombre = '';
      this.descripcion = '';
    }
  }

  onCancelar(): void {
    this.nombre = '';
    this.descripcion = '';
    this.cancelar.emit();
  }
}
