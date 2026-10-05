import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RegistrarVentaRequest, VentaDto } from '../models/venta.model';

@Injectable({
  providedIn: 'root',
})
export class VentaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/ventas`;

  registrarVenta(request: RegistrarVentaRequest): Observable<VentaDto> {
    return this.http.post<VentaDto>(this.apiUrl, request);
  }

  obtenerPorRango(desde?: Date, hasta?: Date): Observable<VentaDto[]> {
    let params = new HttpParams();
    if (desde) {
      params = params.set('desde', desde.toISOString());
    }
    if (hasta) {
      params = params.set('hasta', hasta.toISOString());
    }
    return this.http.get<VentaDto[]>(this.apiUrl, { params });
  }

  obtenerPorId(id: number): Observable<VentaDto> {
    return this.http.get<VentaDto>(`${this.apiUrl}/${id}`);
  }
}
