import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLogDto } from '../../models/auditoria.model';

@Component({
  selector: 'app-tabla-auditoria',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-card">
      <div class="table-responsive">
        <table class="tabla align-middle">
          <thead>
            <tr>
              <th style="width: 170px;">Fecha y Hora (UTC)</th>
              <th style="width: 140px;">Usuario</th>
              <th style="width: 150px;">Entidad</th>
              <th style="width: 100px;" class="text-center">ID</th>
              <th style="width: 120px;" class="text-center">Operación</th>
              <th>Resumen de Cambios</th>
              <th style="width: 90px;" class="text-center">Detalle</th>
            </tr>
          </thead>
          <tbody>
            @if (cargando) {
              <tr>
                <td colspan="7" class="text-center py-5">
                  <div class="spinner mx-auto mb-2"></div>
                  <span class="text-muted">Cargando registros de auditoría...</span>
                </td>
              </tr>
            } @else if (logs.length === 0) {
              <tr>
                <td colspan="7" class="text-center py-5">
                  <div class="empty-state-content">
                    <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <p class="empty-title">Sin registros en la bitácora</p>
                    <p class="empty-subtitle">No se encontraron movimientos registrados con los filtros actuales.</p>
                  </div>
                </td>
              </tr>
            } @else {
              @for (log of logs; track log.id) {
                <tr class="tabla-fila">
                  <!-- Fecha y Hora -->
                  <td>
                    <span class="fecha-hora">{{ formatearFecha(log.timestampUtc) }}</span>
                  </td>

                  <!-- Usuario -->
                  <td>
                    <div class="d-flex align-items-center gap-1">
                      <div class="user-avatar-mini">{{ (log.usuario || 'S')[0].toUpperCase() }}</div>
                      <span class="tabla__usuario">{{ log.usuario || 'Sistema' }}</span>
                    </div>
                  </td>

                  <!-- Entidad -->
                  <td>
                    <span class="tabla__entidad">{{ log.entidad }}</span>
                  </td>

                  <!-- Entidad ID -->
                  <td class="text-center font-mono">
                    <span class="tabla__id">#{{ log.entidadId }}</span>
                  </td>

                  <!-- Operación -->
                  <td class="text-center">
                    <span class="badge-op" [ngClass]="obtenerClaseOperacion(log.operacion)">
                      {{ log.operacion }}
                    </span>
                  </td>

                  <!-- Resumen de Cambios -->
                  <td>
                    <div class="cambios-resumen" [title]="obtenerTooltip(log)">
                      @if (log.operacion.toLowerCase() === 'insert') {
                        <span class="text-success font-semibold">Registro Creado:</span>
                        <span class="json-snippet">{{ log.valoresNuevos || 'Sin payload' }}</span>
                      } @else if (log.operacion.toLowerCase() === 'delete') {
                        <span class="text-danger font-semibold">Registro Eliminado:</span>
                        <span class="json-snippet">{{ log.valoresAnteriores || 'Sin payload' }}</span>
                      } @else {
                        <span class="text-primary font-semibold">Modificado:</span>
                        <span class="json-snippet">{{ log.valoresNuevos || log.valoresAnteriores || 'Valores modificados' }}</span>
                      }
                    </div>
                  </td>

                  <!-- Botón Ver Detalle -->
                  <td class="text-center">
                    <button
                      type="button"
                      class="btn-ver-detalle"
                      (click)="onVerDetalle(log)"
                      title="Ver comparación detallada"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .table-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 0.85rem;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }

    .tabla {
      width: 100%;
      margin-bottom: 0;
      border-collapse: collapse;
    }

    .tabla thead th {
      padding: 0.75rem 1rem;
      border-bottom: 2px solid #f1f5f9;
      color: #94a3b8;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      white-space: nowrap;
      background: #ffffff;
    }

    .tabla tbody td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid #f8fafc;
      font-size: 0.85rem;
    }

    .tabla tbody tr:last-child td {
      border-bottom: none;
    }

    .tabla-fila:hover {
      background-color: #fafbff;
    }

    .fecha-hora {
      font-family: monospace;
      font-size: 0.8rem;
      color: #334155;
      font-weight: 600;
      white-space: nowrap;
    }

    .user-avatar-mini {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      background: #e2e8f0;
      color: #475569;
      font-size: 0.7rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .tabla__usuario {
      font-weight: 600;
      color: #1e293b;
      font-size: 0.84rem;
    }

    .tabla__entidad {
      display: inline-block;
      padding: 0.15rem 0.55rem;
      border-radius: 0.4rem;
      background: rgba(99, 102, 241, 0.08);
      color: #4f46e5;
      font-weight: 700;
      font-size: 0.78rem;
    }

    .tabla__id {
      color: #64748b;
      font-weight: 600;
      font-size: 0.8rem;
    }

    .badge-op {
      display: inline-block;
      padding: 0.18rem 0.6rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .badge-op--insert {
      background: rgba(16, 185, 129, 0.12);
      color: #059669;
    }

    .badge-op--update {
      background: rgba(59, 130, 246, 0.12);
      color: #2563eb;
    }

    .badge-op--delete {
      background: rgba(239, 68, 68, 0.12);
      color: #dc2626;
    }

    .cambios-resumen {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      max-width: 380px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .json-snippet {
      font-family: monospace;
      font-size: 0.76rem;
      color: #64748b;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .btn-ver-detalle {
      width: 2rem;
      height: 2rem;
      border-radius: 0.45rem;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      color: #64748b;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-ver-detalle svg {
      width: 1rem;
      height: 1rem;
    }

    .btn-ver-detalle:hover {
      border-color: #6366f1;
      color: #6366f1;
      background: rgba(99, 102, 241, 0.08);
    }

    .spinner {
      width: 2rem;
      height: 2rem;
      border: 3px solid #e2e8f0;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 2rem 1rem;
    }

    .empty-icon {
      width: 2.5rem;
      height: 2.5rem;
      color: #94a3b8;
    }

    .empty-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #334155;
      margin: 0;
    }

    .empty-subtitle {
      font-size: 0.82rem;
      color: #64748b;
      margin: 0;
    }
  `],
})
export class TablaAuditoriaComponent {
  @Input() logs: AuditLogDto[] = [];
  @Input() cargando: boolean = false;

  @Output() verDetalle = new EventEmitter<AuditLogDto>();

  formatearFecha(isoString: string): string {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const anio = d.getFullYear();
      const horas = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      const segs = String(d.getSeconds()).padStart(2, '0');
      return `${dia}/${mes}/${anio} ${horas}:${mins}:${segs}`;
    } catch {
      return isoString;
    }
  }

  obtenerClaseOperacion(operacion: string): string {
    const op = operacion?.toLowerCase() || '';
    if (op.includes('insert') || op.includes('crear') || op.includes('post')) {
      return 'badge-op--insert';
    }
    if (op.includes('delete') || op.includes('elimin') || op.includes('desactiv')) {
      return 'badge-op--delete';
    }
    return 'badge-op--update';
  }

  obtenerTooltip(log: AuditLogDto): string {
    return `Anterior: ${log.valoresAnteriores || 'null'}\nNuevo: ${log.valoresNuevos || 'null'}`;
  }

  onVerDetalle(log: AuditLogDto): void {
    this.verDetalle.emit(log);
  }
}
