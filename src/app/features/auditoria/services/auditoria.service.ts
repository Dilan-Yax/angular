import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuditLogDto, AuditLogFiltroDto } from '../models/auditoria.model';

@Injectable({
  providedIn: 'root',
})
export class AuditoriaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/audit-log`;

  getAuditLogs(filtro?: AuditLogFiltroDto): Observable<AuditLogDto[]> {
    let params = new HttpParams();

    if (filtro) {
      if (filtro.usuario?.trim()) {
        params = params.set('usuario', filtro.usuario.trim());
      }
      if (filtro.entidad?.trim()) {
        params = params.set('entidad', filtro.entidad.trim());
      }
      if (filtro.desde) {
        params = params.set('desde', filtro.desde);
      }
      if (filtro.hasta) {
        params = params.set('hasta', filtro.hasta);
      }
    }

    return this.http.get<AuditLogDto[]>(this.apiUrl, { params });
  }
}
