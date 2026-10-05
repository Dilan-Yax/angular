import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FormatoReporte, ParametrosReporteDto } from '../models/reporte.model';

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrlVentas = `${environment.apiUrl}/ventas/reporte`;
  private readonly apiUrlCajas = `${environment.apiUrl}/cajas/reporte`;

  descargarReporteVentas(parametros: ParametrosReporteDto): Observable<void> {
    const params = this.construirParams(parametros);

    return this.http
      .get(this.apiUrlVentas, {
        params,
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map((respuesta) => {
          const extension = parametros.formato === 'excel' ? 'xlsx' : 'csv';
          const defaultName = `reporte_ventas_${this.formatearFechaArchivo(new Date())}.${extension}`;
          const nombre =
            this.extraerNombreArchivo(respuesta.headers.get('content-disposition')) ??
            defaultName;

          this.dispararDescarga(respuesta.body, nombre);
        })
      );
  }

  descargarReporteCajas(parametros: ParametrosReporteDto): Observable<void> {
    const params = this.construirParams(parametros);

    return this.http
      .get(this.apiUrlCajas, {
        params,
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map((respuesta) => {
          const extension = parametros.formato === 'excel' ? 'xlsx' : 'csv';
          const defaultName = `reporte_cajas_${this.formatearFechaArchivo(new Date())}.${extension}`;
          const nombre =
            this.extraerNombreArchivo(respuesta.headers.get('content-disposition')) ??
            defaultName;

          this.dispararDescarga(respuesta.body, nombre);
        })
      );
  }

  private construirParams(parametros: ParametrosReporteDto): HttpParams {
    let params = new HttpParams().set('formato', parametros.formato);

    if (parametros.desde) {
      params = params.set('desde', parametros.desde);
    }
    if (parametros.hasta) {
      params = params.set('hasta', parametros.hasta);
    }

    return params;
  }

  private dispararDescarga(body: Blob | null, nombreArchivo: string): void {
    const blob = body ?? new Blob();
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
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

  private formatearFechaArchivo(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  }
}
