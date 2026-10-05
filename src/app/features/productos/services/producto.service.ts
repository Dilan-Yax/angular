import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductoDto, ProductoFilterDto, PagedResultDto } from '../models/producto.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/productos`;

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
    }

    return this.http.get<PagedResultDto<ProductoDto>>(this.apiUrl, { params });
  }
}
