import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ActualizarProductoDto,
  CrearProductoDto,
  ProductoDetalleDto,
} from '../../models/producto.model';
import { CategoriaDto } from '../../../categorias/models/categoria.model';

@Component({
  selector: 'app-formulario-producto-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (visible) {
      <div class="modal-backdrop">
        <div class="modal-card">
          <!-- Cabecera del modal -->
          <div class="modal-header">
            <div class="d-flex align-items-center gap-2">
              <div class="modal-icon-badge" [ngClass]="esEdicion ? 'badge--azul' : 'badge--verde'">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                </svg>
              </div>
              <div>
                <h4 class="modal-title">{{ esEdicion ? 'Editar Producto' : 'Nuevo Producto' }}</h4>
                <p class="modal-subtitle">
                  {{ esEdicion ? ('Modificando SKU: ' + formCodigo) : 'Completa la ficha técnica para ingresarlo al catálogo' }}
                </p>
              </div>
            </div>
            <button type="button" class="btn-close-modal" (click)="onCancelar()" [disabled]="guardando">×</button>
          </div>

          <!-- Alerta de Concurrencia Optimista (OCC 409) -->
          @if (concurrenciaConflicto) {
            <div class="alerta-occ">
              <div class="d-flex align-items-start gap-2">
                <svg class="alerta-occ-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <div>
                  <h5 class="alerta-occ-titulo">El producto fue modificado por otro usuario</h5>
                  <p class="alerta-occ-desc">
                    Los datos que estás viendo están desactualizados. Para proteger la integridad del catálogo, debes recargar los datos antes de volver a guardar.
                  </p>
                </div>
              </div>
              <button type="button" class="btn-recargar" (click)="onRecargar()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                  <path d="M16 21h5v-5"/>
                </svg>
                <span>Recargar Datos</span>
              </button>
            </div>
          }

          <!-- Formulario de Producto -->
          <form (ngSubmit)="onGuardar()">
            <div class="modal-body">
              <div class="row g-3">
                <!-- Código / SKU -->
                <div class="col-12 col-md-6">
                  <label for="formCodigo" class="form-label">
                    Código / SKU <span class="text-danger">*</span>
                  </label>
                  <input
                    id="formCodigo"
                    type="text"
                    class="form-control-custom font-mono"
                    placeholder="Ej: BEB-001, PRD-1024"
                    [(ngModel)]="formCodigo"
                    name="formCodigo"
                    required
                    [disabled]="guardando || concurrenciaConflicto"
                  />
                </div>

                <!-- Categoría -->
                <div class="col-12 col-md-6">
                  <label for="formCategoria" class="form-label">
                    Categoría <span class="text-danger">*</span>
                  </label>
                  <select
                    id="formCategoria"
                    class="form-select-custom"
                    [(ngModel)]="formIdCategoria"
                    name="formIdCategoria"
                    required
                    [disabled]="guardando || concurrenciaConflicto"
                  >
                    <option [ngValue]="null" disabled>Selecciona una categoría...</option>
                    @for (cat of categorias; track cat.id) {
                      <option [ngValue]="cat.id">{{ cat.nombre }}</option>
                    }
                  </select>
                </div>

                <!-- Nombre -->
                <div class="col-12">
                  <label for="formNombre" class="form-label">
                    Nombre del Producto <span class="text-danger">*</span>
                  </label>
                  <input
                    id="formNombre"
                    type="text"
                    class="form-control-custom"
                    placeholder="Ej: Coca Cola 2.5L No Retornable"
                    [(ngModel)]="formNombre"
                    name="formNombre"
                    required
                    [disabled]="guardando || concurrenciaConflicto"
                  />
                </div>

                <!-- Descripción -->
                <div class="col-12">
                  <label for="formDesc" class="form-label">Descripción</label>
                  <textarea
                    id="formDesc"
                    class="form-control-custom form-textarea"
                    rows="2"
                    placeholder="Detalles sobre presentación, empaque, ingredientes..."
                    [(ngModel)]="formDescripcion"
                    name="formDescripcion"
                    [disabled]="guardando || concurrenciaConflicto"
                  ></textarea>
                </div>

                <!-- Precio de Venta -->
                <div class="col-12 col-md-4">
                  <label for="formPrecio" class="form-label">
                    Precio (Q) <span class="text-danger">*</span>
                  </label>
                  <input
                    id="formPrecio"
                    type="number"
                    min="0"
                    step="0.01"
                    class="form-control-custom font-bold"
                    placeholder="0.00"
                    [(ngModel)]="formPrecio"
                    name="formPrecio"
                    required
                    [disabled]="guardando || concurrenciaConflicto"
                  />
                </div>

                <!-- Stock Inicial / Actual -->
                <div class="col-12 col-md-4">
                  <label for="formStockActual" class="form-label">
                    Stock Actual <span class="text-danger">*</span>
                  </label>
                  <input
                    id="formStockActual"
                    type="number"
                    min="0"
                    step="1"
                    class="form-control-custom font-bold"
                    placeholder="0"
                    [(ngModel)]="formStockActual"
                    name="formStockActual"
                    required
                    [disabled]="guardando || concurrenciaConflicto"
                  />
                </div>

                <!-- Stock Mínimo -->
                <div class="col-12 col-md-4">
                  <label for="formStockMinimo" class="form-label">
                    Stock Mínimo <span class="text-danger">*</span>
                  </label>
                  <input
                    id="formStockMinimo"
                    type="number"
                    min="0"
                    step="1"
                    class="form-control-custom"
                    placeholder="5"
                    [(ngModel)]="formStockMinimo"
                    name="formStockMinimo"
                    required
                    [disabled]="guardando || concurrenciaConflicto"
                  />
                </div>
              </div>
            </div>

            <!-- Botones del pie -->
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
                [disabled]="guardando || concurrenciaConflicto || !esFormularioValido()"
              >
                @if (guardando) {
                  <span class="spinner-sm"></span>
                  <span>Guardando...</span>
                } @else {
                  <span>{{ esEdicion ? 'Actualizar Producto' : 'Crear Producto' }}</span>
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
      max-width: 620px;
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
      width: 1.25rem;
      height: 1.25rem;
    }

    .badge--azul {
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
    }

    .badge--verde {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .modal-title {
      margin: 0;
      font-size: 1.1rem;
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

    /* ── Banner de Alerta OCC ───────────────────────────────── */
    .alerta-occ {
      background: #fef2f2;
      border-bottom: 1px solid #fecaca;
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      animation: fadeIn 0.2s ease;
    }

    .alerta-occ-icon {
      width: 1.4rem;
      height: 1.4rem;
      color: #dc2626;
      flex-shrink: 0;
      margin-top: 0.1rem;
    }

    .alerta-occ-titulo {
      margin: 0 0 0.15rem;
      font-size: 0.88rem;
      font-weight: 800;
      color: #991b1b;
    }

    .alerta-occ-desc {
      margin: 0;
      font-size: 0.76rem;
      color: #7f1d1d;
      line-height: 1.35;
    }

    .btn-recargar {
      background: #dc2626;
      color: #ffffff;
      border: none;
      padding: 0.45rem 0.85rem;
      border-radius: 0.45rem;
      font-size: 0.78rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      cursor: pointer;
      flex-shrink: 0;
      transition: background 0.15s ease;
    }

    .btn-recargar svg {
      width: 0.95rem;
      height: 0.95rem;
    }

    .btn-recargar:hover {
      background: #b91c1c;
    }

    .modal-body {
      padding: 1.5rem;
      background: #ffffff;
    }

    .form-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 700;
      color: #334155;
      margin-bottom: 0.35rem;
    }

    .form-control-custom, .form-select-custom {
      width: 100%;
      height: 2.5rem;
      padding: 0 0.85rem;
      background: #f8fafc;
      border: 1.5px solid #cbd5e1;
      border-radius: 0.55rem;
      font-size: 0.88rem;
      color: #0f172a;
      transition: all 0.2s ease;
    }

    .form-control-custom:focus, .form-select-custom:focus {
      outline: none;
      background: #ffffff;
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
    }

    .form-control-custom:disabled, .form-select-custom:disabled {
      background: #f1f5f9;
      cursor: not-allowed;
      opacity: 0.7;
    }

    .font-mono {
      font-family: monospace;
    }

    .font-bold {
      font-weight: 700;
    }

    .form-textarea {
      height: auto;
      padding: 0.6rem 0.85rem;
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

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class FormularioProductoModalComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() producto: ProductoDetalleDto | null = null;
  @Input() categorias: CategoriaDto[] = [];
  @Input() guardando: boolean = false;
  @Input() concurrenciaConflicto: boolean = false;

  @Output() guardar = new EventEmitter<{ id?: number; data: CrearProductoDto | ActualizarProductoDto }>();
  @Output() recargar = new EventEmitter<number>();
  @Output() cancelar = new EventEmitter<void>();

  esEdicion: boolean = false;

  formCodigo: string = '';
  formIdCategoria: number | null = null;
  formNombre: string = '';
  formDescripcion: string = '';
  formPrecio: number | null = null;
  formStockActual: number | null = null;
  formStockMinimo: number | null = 5;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['producto'] || changes['visible']) {
      if (this.producto) {
        this.esEdicion = true;
        this.formCodigo = this.producto.codigo;
        this.formIdCategoria = this.producto.idCategoria;
        this.formNombre = this.producto.nombre;
        this.formDescripcion = this.producto.descripcion || '';
        this.formPrecio = this.producto.precio;
        this.formStockActual = this.producto.stockActual;
        this.formStockMinimo = this.producto.stockMinimo;
      } else {
        this.esEdicion = false;
        this.formCodigo = '';
        this.formIdCategoria = this.categorias.length > 0 ? this.categorias[0].id : null;
        this.formNombre = '';
        this.formDescripcion = '';
        this.formPrecio = null;
        this.formStockActual = 0;
        this.formStockMinimo = 5;
      }
    }
  }

  esFormularioValido(): boolean {
    return (
      Boolean(this.formCodigo?.trim()) &&
      this.formIdCategoria !== null &&
      Boolean(this.formNombre?.trim()) &&
      this.formPrecio !== null &&
      this.formPrecio >= 0 &&
      this.formStockActual !== null &&
      this.formStockActual >= 0 &&
      this.formStockMinimo !== null &&
      this.formStockMinimo >= 0
    );
  }

  onGuardar(): void {
    if (!this.esFormularioValido()) return;

    const data: CrearProductoDto | ActualizarProductoDto = {
      idCategoria: this.formIdCategoria!,
      codigo: this.formCodigo.trim(),
      nombre: this.formNombre.trim(),
      descripcion: this.formDescripcion.trim() || undefined,
      precio: Number(this.formPrecio),
      stockActual: Number(this.formStockActual),
      stockMinimo: Number(this.formStockMinimo),
      version: this.producto?.version,
    };

    this.guardar.emit({
      id: this.producto?.id,
      data,
    });
  }

  onRecargar(): void {
    if (this.producto) {
      this.recargar.emit(this.producto.id);
    }
  }

  onCancelar(): void {
    this.cancelar.emit();
  }
}
