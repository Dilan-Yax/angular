import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ActualizarProductoDto,
  CrearProductoDto,
  PagedResultDto,
  ProductoDetalleDto,
  ProductoDto,
  ProductoFilterDto,
} from '../models/producto.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/productos`;

  getProductos(
    filtro?: ProductoFilterDto | { [key: string]: any }
  ): Observable<PagedResultDto<ProductoDto>> {
    let params = new HttpParams();

    if (filtro) {
      const f = filtro as Record<string, any>;
      const page = f['pageNumber'] ?? f['page'];
      if (page !== undefined && page !== null) {
        params = params.set('Page', page.toString());
      }

      const pageSize = f['pageSize'];
      if (pageSize !== undefined && pageSize !== null) {
        params = params.set('PageSize', pageSize.toString());
      }

      const search = f['search'] ?? f['searchTerm'];
      if (search) {
        params = params.set('SearchTerm', search);
      }

      const categoriaId = f['categoriaId'];
      if (categoriaId !== undefined && categoriaId !== null) {
        params = params.set('CategoriaId', categoriaId.toString());
      }

      const isActive = f['isActive'];
      if (isActive !== undefined && isActive !== null) {
        params = params.set('IsActive', isActive.toString());
      }

      const soloStockBajo = f['soloStockBajo'];
      if (soloStockBajo !== undefined && soloStockBajo !== null) {
        params = params.set('SoloStockBajo', soloStockBajo.toString());
      }

      const sortBy = f['sortBy'];
      if (sortBy) {
        params = params.set('SortBy', sortBy);
      }

      const isAscending = f['isAscending'];
      if (isAscending !== undefined && isAscending !== null) {
        params = params.set('IsAscending', isAscending.toString());
      }
    }

    return this.http.get<PagedResultDto<ProductoDto>>(this.apiUrl, { params });
  }

  getProducto(id: number): Observable<ProductoDetalleDto> {
    return this.http.get<ProductoDetalleDto>(`${this.apiUrl}/${id}`);
  }

  crearProducto(dto: CrearProductoDto): Observable<ProductoDetalleDto> {
    return this.http.post<ProductoDetalleDto>(this.apiUrl, dto);
  }

  actualizarProducto(id: number, dto: ActualizarProductoDto): Observable<ProductoDetalleDto> {
    return this.http.put<ProductoDetalleDto>(`${this.apiUrl}/${id}`, dto);
  }

  desactivarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
