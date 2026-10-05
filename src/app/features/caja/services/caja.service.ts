import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AbrirCajaDto,
  CajaFiltroDto,
  CajaSesionDto,
  CerrarCajaDto,
  EstadoCajaResponseDto,
  PagedResultDto,
} from '../models/caja.model';

@Injectable({
  providedIn: 'root',
})
export class CajaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/cajas`;

  getEstadoActual(): Observable<EstadoCajaResponseDto> {
    return this.http.get<EstadoCajaResponseDto>(`${this.apiUrl}/estado-actual`);
  }

  abrirCaja(dto: AbrirCajaDto): Observable<CajaSesionDto> {
    return this.http.post<CajaSesionDto>(`${this.apiUrl}/abrir`, dto);
  }

  cerrarCaja(id: number, dto: CerrarCajaDto): Observable<CajaSesionDto> {
    return this.http.post<CajaSesionDto>(`${this.apiUrl}/${id}/cerrar`, dto);
  }

  getHistorial(filtro?: CajaFiltroDto | any): Observable<PagedResultDto<CajaSesionDto>> {
    let params = new HttpParams();
    if (filtro) {
      if (filtro.fechaInicio) params = params.set('fechaInicio', filtro.fechaInicio.toString());
      if (filtro.fechaFin) params = params.set('fechaFin', filtro.fechaFin.toString());
      if (filtro.usuarioId) params = params.set('usuarioId', filtro.usuarioId.toString());
      if (filtro.estado) params = params.set('estado', filtro.estado);
      if (filtro.page) params = params.set('page', filtro.page.toString());
      if (filtro.pageSize) params = params.set('pageSize', filtro.pageSize.toString());
    }
    return this.http.get<PagedResultDto<CajaSesionDto>>(`${this.apiUrl}/historial`, { params });
  }
}
