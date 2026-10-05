import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AuditoriaService } from '../../services/auditoria.service';
import { AuditLogDto, AuditLogFiltroDto } from '../../models/auditoria.model';
import { FiltrosAuditoriaComponent } from '../filtros-auditoria/filtros-auditoria.component';
import { TablaAuditoriaComponent } from '../tabla-auditoria/tabla-auditoria.component';
import { PaginadorComponent } from '../../../usuarios/components/paginador/paginador.component';

@Component({
  selector: 'app-auditoria-page',
  standalone: true,
  imports: [
    CommonModule,
    FiltrosAuditoriaComponent,
    TablaAuditoriaComponent,
    PaginadorComponent,
  ],
  template: `
    <div class="auditoria-layout">
      <!-- Encabezado / Panel de Control -->
      <div class="panel-header mb-4">
        <div>
          <h2 class="panel-titulo">Bitácora de Auditoría</h2>
          <p class="panel-subtitulo">
            Trazabilidad y registro de cambios en el sistema
            <span class="badge-total">{{ totalItems() }} eventos</span>
          </p>
        </div>

        <div class="header-actions">
          <button
            type="button"
            class="btn-refrescar"
            (click)="cargarLogs()"
            [disabled]="cargando()"
            title="Refrescar bitácora"
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

      <!-- Alertas informativas -->
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

      <!-- Presentacional: Filtros -->
      <app-filtros-auditoria
        [entidadesDisponibles]="entidadesDetectadas()"
        (filtrar)="onFiltrar($event)"
        (limpiar)="onLimpiarFiltros()"
      />

      <!-- Presentacional: Tabla de Solo Lectura -->
      <app-tabla-auditoria
        [logs]="logsPaginados()"
        [cargando]="cargando()"
        (verDetalle)="abrirModalDetalle($event)"
      />

      <!-- Presentacional Transversal: Paginador Reutilizable -->
      <div class="mt-3">
        <app-paginador
          [page]="paginaActual()"
          [pageSize]="pageSize()"
          [totalItems]="totalItems()"
          [totalPages]="totalPages()"
          (cambiarPagina)="cambiarPagina($event)"
          (cambiarTamano)="cambiarTamano($event)"
        />
      </div>

      <!-- Modal de Detalle de Auditoría -->
      @if (modalDetalleVisible() && logSeleccionado()) {
        <div class="modal-backdrop">
          <div class="modal-card">
            <!-- Cabecera -->
            <div class="modal-header">
              <div class="d-flex align-items-center gap-2">
                <div class="modal-badge-op" [ngClass]="obtenerClaseOp(logSeleccionado()!.operacion)">
                  {{ logSeleccionado()!.operacion }}
                </div>
                <div>
                  <h4 class="modal-title">
                    {{ logSeleccionado()!.entidad }} #{{ logSeleccionado()!.entidadId }}
                  </h4>
                  <p class="modal-subtitle">
                    Por {{ logSeleccionado()!.usuario || 'Sistema' }} • {{ formatearFecha(logSeleccionado()!.timestampUtc) }}
                  </p>
                </div>
              </div>
              <button type="button" class="btn-close-modal" (click)="cerrarModalDetalle()">×</button>
            </div>

            <!-- Contenido del Modal: Valores Anteriores vs Valores Nuevos -->
            <div class="modal-body">
              <div class="row g-3">
                <!-- Valores Anteriores -->
                <div class="col-12 col-md-6">
                  <div class="diff-block diff-block--old">
                    <div class="diff-header">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                      </svg>
                      <span>Valores Anteriores (Estado Previo)</span>
                    </div>
                    <pre class="diff-content">{{ formatearJson(logSeleccionado()!.valoresAnteriores) }}</pre>
                  </div>
                </div>

                <!-- Valores Nuevos -->
                <div class="col-12 col-md-6">
                  <div class="diff-block diff-block--new">
                    <div class="diff-header">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                      </svg>
                      <span>Valores Nuevos (Resultado)</span>
                    </div>
                    <pre class="diff-content">{{ formatearJson(logSeleccionado()!.valoresNuevos) }}</pre>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pie del Modal -->
            <div class="modal-footer">
              <button type="button" class="btn-cerrar" (click)="cerrarModalDetalle()">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .auditoria-layout {
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

    .badge-total {
      display: inline-block;
      padding: 0.15rem 0.6rem;
      border-radius: 9999px;
      background: rgba(99, 102, 241, 0.1);
      color: #4f46e5;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
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

    .alerta-box {
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

    /* Modal de Detalle Diff */
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
      max-width: 820px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
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

    .modal-badge-op {
      padding: 0.3rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.8rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge-op--insert {
      background: rgba(16, 185, 129, 0.15);
      color: #059669;
    }

    .badge-op--update {
      background: rgba(59, 130, 246, 0.15);
      color: #2563eb;
    }

    .badge-op--delete {
      background: rgba(239, 68, 68, 0.15);
      color: #dc2626;
    }

    .modal-title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
    }

    .modal-subtitle {
      margin: 0.15rem 0 0;
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
      padding: 1.25rem 1.5rem;
      overflow-y: auto;
      flex: 1;
    }

    .diff-block {
      border-radius: 0.6rem;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .diff-header {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.6rem 0.85rem;
      font-size: 0.76rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .diff-header svg {
      width: 0.95rem;
      height: 0.95rem;
    }

    .diff-block--old .diff-header {
      background: #fef2f2;
      color: #991b1b;
      border-bottom: 1px solid #fecaca;
    }

    .diff-block--new .diff-header {
      background: #ecfdf5;
      color: #065f46;
      border-bottom: 1px solid #a7f3d0;
    }

    .diff-content {
      margin: 0;
      padding: 0.85rem;
      background: #f8fafc;
      font-family: monospace;
      font-size: 0.78rem;
      color: #1e293b;
      max-height: 320px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-all;
      flex: 1;
    }

    .modal-footer {
      padding: 0.85rem 1.5rem;
      border-top: 1px solid #f1f5f9;
      display: flex;
      justify-content: flex-end;
      background: #f8fafc;
    }

    .btn-cerrar {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #475569;
      padding: 0.5rem 1.2rem;
      border-radius: 0.5rem;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-cerrar:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class AuditoriaPageComponent implements OnInit {
  private readonly auditoriaService = inject(AuditoriaService);

  // Signals de estado
  readonly logs = signal<AuditLogDto[]>([]);
  readonly cargando = signal<boolean>(false);
  readonly filtrosActuales = signal<AuditLogFiltroDto>({});
  readonly paginaActual = signal<number>(1);
  readonly pageSize = signal<number>(10);

  // Signals para Modal de Detalle
  readonly logSeleccionado = signal<AuditLogDto | null>(null);
  readonly modalDetalleVisible = signal<boolean>(false);

  // Alerta informativa
  readonly alerta = signal<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);

  // Computeds
  readonly totalItems = computed(() => this.logs().length);

  readonly totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.totalItems() / this.pageSize()));
  });

  readonly logsPaginados = computed(() => {
    const page = this.paginaActual();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return this.logs().slice(start, start + size);
  });

  readonly entidadesDetectadas = computed(() => {
    const nombres = this.logs().map((l) => l.entidad).filter(Boolean);
    return Array.from(new Set(nombres));
  });

  ngOnInit(): void {
    this.cargarLogs();
  }

  async cargarLogs(): Promise<void> {
    this.cargando.set(true);
    try {
      const resp = await firstValueFrom(
        this.auditoriaService.getAuditLogs(this.filtrosActuales())
      );
      this.logs.set(resp ?? []);
      // Si la página actual excede el nuevo total de páginas, reset a 1
      if (this.paginaActual() > this.totalPages()) {
        this.paginaActual.set(1);
      }
    } catch (err: any) {
      console.error('Error al consultar bitácora de auditoría:', err);
      this.logs.set([]);
      this.alerta.set({
        tipo: 'error',
        mensaje:
          err.status === 403
            ? 'Acceso denegado: Se requiere rol de Administrador para ver la auditoría.'
            : 'Error al conectar con el servidor para obtener los registros de auditoría.',
      });
    } finally {
      this.cargando.set(false);
    }
  }

  onFiltrar(filtro: AuditLogFiltroDto): void {
    this.filtrosActuales.set(filtro);
    this.paginaActual.set(1);
    this.cargarLogs();
  }

  onLimpiarFiltros(): void {
    this.filtrosActuales.set({});
    this.paginaActual.set(1);
    this.cargarLogs();
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPages() && nuevaPagina !== this.paginaActual()) {
      this.paginaActual.set(nuevaPagina);
    }
  }

  cambiarTamano(nuevoTamano: number): void {
    if (nuevoTamano !== this.pageSize()) {
      this.pageSize.set(nuevoTamano);
      this.paginaActual.set(1);
    }
  }

  abrirModalDetalle(log: AuditLogDto): void {
    this.logSeleccionado.set(log);
    this.modalDetalleVisible.set(true);
  }

  cerrarModalDetalle(): void {
    this.modalDetalleVisible.set(false);
    this.logSeleccionado.set(null);
  }

  formatearFecha(isoString: string): string {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('es-GT', { timeZone: 'UTC' });
    } catch {
      return isoString;
    }
  }

  formatearJson(raw: string | null): string {
    if (!raw) return '(Sin datos / Estado inicial)';
    try {
      const parsed = JSON.parse(raw);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return raw;
    }
  }

  obtenerClaseOp(operacion: string): string {
    const op = operacion?.toLowerCase() || '';
    if (op.includes('insert') || op.includes('crear') || op.includes('post')) {
      return 'badge-op--insert';
    }
    if (op.includes('delete') || op.includes('elimin') || op.includes('desactiv')) {
      return 'badge-op--delete';
    }
    return 'badge-op--update';
  }
}
