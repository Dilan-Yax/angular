import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CrearUsuarioRequest,
  PagedResultDto,
  UsuarioDetalleDto,
  UsuarioDto,
  UsuarioFilterDto,
} from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/usuarios`;

  obtenerPaginado(filtros: UsuarioFilterDto): Observable<PagedResultDto<UsuarioDto>> {
    return this.http.get<PagedResultDto<UsuarioDto>>(this.apiUrl, {
      params: this.construirParams(filtros),
    });
  }

  obtenerDetalle(id: number): Observable<UsuarioDetalleDto> {
    return this.http.get<UsuarioDetalleDto>(`${this.apiUrl}/${id}`);
  }

  crearUsuario(datos: CrearUsuarioRequest): Observable<UsuarioDto> {
    return this.http.post<UsuarioDto>(this.apiUrl, datos);
  }

  actualizarUsuario(id: number, datos: CrearUsuarioRequest): Observable<UsuarioDto> {
    return this.http.put<UsuarioDto>(`${this.apiUrl}/${id}`, datos);
  }

  desactivarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  descargarReporte(filtros: UsuarioFilterDto, formato: 'excel' | 'csv'): Observable<void> {
    const params = this.construirParams(filtros).set('formato', formato);

    return this.http
      .get(this.apiUrl + '/reporte', {
        params,
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map((respuesta) => {
          const blob = respuesta.body ?? new Blob();
          const nombre =
            this.extraerNombreArchivo(respuesta.headers.get('content-disposition')) ??
            `usuarios_${formatearFechaArchivo(new Date())}.${formato === 'excel' ? 'xlsx' : 'csv'}`;

          const url = URL.createObjectURL(blob);
          const enlace = document.createElement('a');
          enlace.href = url;
          enlace.download = nombre;
          document.body.appendChild(enlace);
          enlace.click();
          document.body.removeChild(enlace);
          URL.revokeObjectURL(url);
        }),
      );
  }

  private construirParams(filtros: UsuarioFilterDto): HttpParams {
    let params = new HttpParams()
      .set('page', filtros.page)
      .set('pageSize', filtros.pageSize)
      .set('isAscending', filtros.isAscending);

    if (filtros.searchTerm?.trim()) {
      params = params.set('searchTerm', filtros.searchTerm.trim());
    }
    if (filtros.rolId) {
      params = params.set('rolId', filtros.rolId);
    }
    if (filtros.isActive !== null && filtros.isActive !== undefined) {
      params = params.set('isActive', filtros.isActive);
    }
    if (filtros.fechaDesde) {
      params = params.set('fechaDesde', filtros.fechaDesde);
    }
    if (filtros.fechaHasta) {
      params = params.set('fechaHasta', filtros.fechaHasta);
    }
    if (filtros.sortBy) {
      params = params.set('sortBy', filtros.sortBy);
    }

    return params;
  }

  private extraerNombreArchivo(disposicion: string | null): string | null {
    if (!disposicion) {
      return null;
    }

    const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(disposicion);
    if (utf8?.[1]) {
      return decodeURIComponent(utf8[1]);
    }

    const simple = /filename="?([^";]+)"?/i.exec(disposicion);
    return simple?.[1] ?? null;
  }
}

function formatearFechaArchivo(fecha: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    `${fecha.getFullYear()}${p(fecha.getMonth() + 1)}${p(fecha.getDate())}` +
    `_${p(fecha.getHours())}${p(fecha.getMinutes())}${p(fecha.getSeconds())}`
  );
}