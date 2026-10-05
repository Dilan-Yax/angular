import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CajaSesionDto } from '../../models/caja.model';

@Component({
  selector: 'app-caja-historial',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="seccion">
      <div class="seccion__cabecera">
        <div>
          <h3 class="seccion__titulo">Historial Reciente de Turnos</h3>
          <span class="seccion__detalle">Registro de aperturas, cierres y arqueos de caja</span>
        </div>
      </div>

      @if (cargando) {
        <div class="historial-loading">
          <div class="spinner"></div>
          <p class="mb-0">Cargando historial de turnos...</p>
        </div>
      } @else if (historial.length === 0) {
        <p class="seccion__vacio text-center py-4">No se han registrado turnos de caja todavía.</p>
      } @else {
        <div class="table-responsive">
          <table class="tabla align-middle">
            <thead>
              <tr>
                <th>Turno #</th>
                <th>Cajero</th>
                <th>Apertura</th>
                <th>Cierre</th>
                <th class="text-end">Fondo Inicial</th>
                <th class="text-end">Ventas Efec.</th>
                <th class="text-end">Esperado</th>
                <th class="text-end">Monto Real</th>
                <th class="text-center">Diferencia</th>
                <th class="text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              @for (sesion of historial; track sesion.id) {
                <tr>
                  <td>
                    <span class="tabla__codigo">#{{ sesion.id }}</span>
                  </td>
                  <td>
                    <span class="tabla__nombre">{{ sesion.nombreUsuario }}</span>
                  </td>
                  <td>
                    <span class="tabla__fecha">{{ sesion.fechaApertura | date:'short' }}</span>
                  </td>
                  <td>
                    <span class="tabla__fecha">
                      {{ sesion.fechaCierre ? (sesion.fechaCierre | date:'short') : '—' }}
                    </span>
                  </td>
                  <td class="text-end">
                    <span class="tabla__monto">Q{{ sesion.montoInicial | number:'1.2-2' }}</span>
                  </td>
                  <td class="text-end">
                    <span class="tabla__monto text-success">Q{{ sesion.totalVentasEfectivo | number:'1.2-2' }}</span>
                  </td>
                  <td class="text-end">
                    <span class="tabla__monto text-warning-dark">Q{{ sesion.montoEsperado | number:'1.2-2' }}</span>
                  </td>
                  <td class="text-end">
                    <span class="tabla__monto">
                      {{ sesion.montoReal !== null && sesion.montoReal !== undefined ? ('Q' + (sesion.montoReal | number:'1.2-2')) : '—' }}
                    </span>
                  </td>
                  <td class="text-center">
                    @if (sesion.diferencia !== null && sesion.diferencia !== undefined) {
                      <span
                        class="diferencia-badge"
                        [ngClass]="sesion.diferencia === 0 ? 'dif--cero' : (sesion.diferencia > 0 ? 'dif--pos' : 'dif--neg')"
                      >
                        {{ sesion.diferencia >= 0 ? '+' : '' }}Q{{ sesion.diferencia | number:'1.2-2' }}
                      </span>
                    } @else {
                      <span class="text-muted">—</span>
                    }
                  </td>
                  <td class="text-center">
                    <span
                      class="estado"
                      [ngClass]="sesion.estado === 'Abierta' || sesion.estado === '1' ? 'estado--ok' : 'estado--cerrado'"
                    >
                      {{ sesion.estado === '1' ? 'Abierta' : (sesion.estado === '2' ? 'Cerrada' : sesion.estado) }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .seccion {
      padding: 1.25rem 1.5rem 1.5rem;
      border-radius: 0.85rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    }

    .seccion__cabecera {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }

    .seccion__titulo {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
    }

    .seccion__detalle {
      color: #94a3b8;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .seccion__vacio {
      color: #94a3b8;
      font-size: 0.9rem;
    }

    .tabla {
      width: 100%;
      margin-bottom: 0;
      border-collapse: collapse;
    }

    .tabla thead th {
      padding: 0.6rem 0.75rem;
      border-bottom: 2px solid #f1f5f9;
      color: #94a3b8;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      white-space: nowrap;
    }

    .tabla tbody td {
      padding: 0.75rem 0.75rem;
      border-bottom: 1px solid #f8fafc;
      font-size: 0.85rem;
    }

    .tabla tbody tr:last-child td {
      border-bottom: none;
    }

    .tabla tbody tr:hover {
      background-color: #fafbff;
    }

    .tabla__codigo {
      font-family: monospace;
      font-weight: 700;
      color: #6366f1;
    }

    .tabla__nombre {
      font-weight: 700;
      color: #1e293b;
    }

    .tabla__fecha {
      color: #64748b;
      font-size: 0.8rem;
    }

    .tabla__monto {
      font-weight: 700;
      color: #0f172a;
    }

    .text-success {
      color: #10b981 !important;
    }

    .text-warning-dark {
      color: #d97706 !important;
    }

    .diferencia-badge {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      border-radius: 0.4rem;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .dif--cero {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .dif--pos {
      background: rgba(99, 102, 241, 0.1);
      color: #4f46e5;
    }

    .dif--neg {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .estado {
      display: inline-block;
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
    }

    .estado--ok {
      background: rgba(16,185,129,0.1);
      color: #10b981;
    }

    .estado--cerrado {
      background: #f1f5f9;
      color: #64748b;
    }

    .historial-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 1rem;
      color: #64748b;
    }

    .spinner {
      width: 2rem;
      height: 2rem;
      border: 3px solid #e2e8f0;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 0.75rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class CajaHistorialComponent {
  @Input() historial: CajaSesionDto[] = [];
  @Input() cargando: boolean = false;
}
