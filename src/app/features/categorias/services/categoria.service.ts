import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoriaDto, CrearCategoriaDto } from '../models/categoria.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/categorias`;

  getCategorias(): Observable<CategoriaDto[]> {
    return this.http.get<CategoriaDto[]>(this.apiUrl);
  }

  getCategoria(id: number): Observable<CategoriaDto> {
    return this.http.get<CategoriaDto>(`${this.apiUrl}/${id}`);
  }

  crearCategoria(dto: CrearCategoriaDto): Observable<CategoriaDto> {
    return this.http.post<CategoriaDto>(this.apiUrl, dto);
  }

  desactivarCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
