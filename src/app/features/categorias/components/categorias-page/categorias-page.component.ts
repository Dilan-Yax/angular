import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { CategoriaService } from '../../services/categoria.service';
import { CategoriaDto, CrearCategoriaDto } from '../../models/categoria.model';
import { ListaCategoriasComponent } from '../lista-categorias/lista-categorias.component';
import { FormularioCategoriaModalComponent } from '../formulario-categoria-modal/formulario-categoria-modal.component';

@Component({
  selector: 'app-categorias-page',
  standalone: true,
  imports: [
    CommonModule,
    ListaCategoriasComponent,
    FormularioCategoriaModalComponent,
  ],
  template: `
    <div class="categorias-layout">
      <!-- Panel de Control Superior -->
      <div class="panel mb-4">
        <div>
          <h2 class="panel__titulo">Categorías de Productos</h2>
          <p class="panel__subtitulo mb-0">
            Administración de grupos y clasificaciones del inventario
          </p>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button
            type="button"
            class="btn-refrescar"
            (click)="cargarCategorias()"
            [disabled]="cargando()"
            title="Recargar lista"
          >
            <svg class="icon-sm" [class.animate-spin]="cargando()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
            <span>Actualizar</span>
          </button>

          <button
            type="button"
            class="btn-nueva-categoria"
            (click)="modalCrearVisible.set(true)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Nueva Categoría</span>
          </button>
        </div>
      </div>

      <!-- Alertas del sistema -->
      @if (alerta()) {
        <div class="cat-alerta" [ngClass]="'cat-alerta--' + alerta()?.tipo">
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

      <!-- Presentacional: Tabla de Categorías -->
      <app-lista-categorias
        [categorias]="categorias()"
        [cargando]="cargando()"
        (desactivar)="ejecutarDesactivar($event)"
      />

      <!-- Presentacional: Modal de Creación -->
      <app-formulario-categoria-modal
        [visible]="modalCrearVisible()"
        [guardando]="guardando()"
        (guardar)="ejecutarCrear($event)"
        (cancelar)="modalCrearVisible.set(false)"
      />
    </div>
  `,
  styles: [`
    .categorias-layout {
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

    .btn-nueva-categoria {
      background: #4f46e5;
      color: #ffffff;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 0.55rem;
      font-size: 0.86rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
      transition: all 0.18s ease;
    }

    .btn-nueva-categoria svg {
      width: 1.1rem;
      height: 1.1rem;
    }

    .btn-nueva-categoria:hover {
      background: #4338ca;
    }

    .icon-sm {
      width: 1rem;
      height: 1rem;
    }

    .animate-spin {
      animation: spin 0.8s linear infinite;
    }

    .cat-alerta {
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

    .cat-alerta svg {
      width: 1.2rem;
      height: 1.2rem;
      flex-shrink: 0;
    }

    .cat-alerta--exito {
      background: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.25);
      color: #065f46;
    }

    .cat-alerta--error {
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
  `]
})
export class CategoriasPageComponent implements OnInit {
  private readonly categoriaService = inject(CategoriaService);

  readonly categorias = signal<CategoriaDto[]>([]);
  readonly cargando = signal<boolean>(false);
  readonly guardando = signal<boolean>(false);
  readonly modalCrearVisible = signal<boolean>(false);
  readonly alerta = signal<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);

  ngOnInit(): void {
    this.cargarCategorias();
  }

  async cargarCategorias(): Promise<void> {
    this.cargando.set(true);
    try {
      const resp = await firstValueFrom(this.categoriaService.getCategorias());
      this.categorias.set(resp ?? []);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      this.alerta.set({
        tipo: 'error',
        mensaje: 'No fue posible cargar el listado de categorías.',
      });
    } finally {
      this.cargando.set(false);
    }
  }

  async ejecutarCrear(dto: CrearCategoriaDto): Promise<void> {
    this.guardando.set(true);
    this.alerta.set(null);

    try {
      const nueva = await firstValueFrom(this.categoriaService.crearCategoria(dto));
      this.modalCrearVisible.set(false);
      this.alerta.set({
        tipo: 'exito',
        mensaje: `¡Categoría "${nueva.nombre}" creada con éxito!`,
      });
      await this.cargarCategorias();
    } catch (err: any) {
      console.error('Error al crear categoría:', err);
      const detalle = err.error?.detail || err.error?.title || 'No se pudo crear la categoría.';
      this.alerta.set({
        tipo: 'error',
        mensaje: `Error al crear categoría: ${detalle}`,
      });
    } finally {
      this.guardando.set(false);
    }
  }

  async ejecutarDesactivar(id: number): Promise<void> {
    try {
      await firstValueFrom(this.categoriaService.desactivarCategoria(id));
      this.alerta.set({
        tipo: 'exito',
        mensaje: 'Categoría desactivada correctamente.',
      });
      await this.cargarCategorias();
    } catch (err: any) {
      console.error('Error al desactivar categoría:', err);
      const detalle = err.error?.detail || err.error?.title || 'No se pudo desactivar la categoría.';
      this.alerta.set({
        tipo: 'error',
        mensaje: `Error al desactivar categoría: ${detalle}`,
      });
    }
  }
}
