export interface ProductoDto {
  id: number;
  idCategoria?: number;
  nombreCategoria?: string;
  codigo?: string;
  sku?: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stockActual?: number;
  stock?: number;
  stockMinimo?: number;
  stockBajo?: boolean;
  isActive?: boolean;
  estado?: string;
}

export interface ProductoDetalleDto {
  id: number;
  idCategoria: number;
  nombreCategoria: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stockActual: number;
  stockMinimo: number;
  stockBajo: boolean;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc?: string;
  version: number;
}

export interface CrearProductoDto {
  idCategoria: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stockActual: number;
  stockMinimo: number;
}

export interface ActualizarProductoDto {
  idCategoria: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stockActual: number;
  stockMinimo: number;
  version?: number;
}

export interface ProductoFilterDto {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  searchTerm?: string;
  categoriaId?: number;
  isActive?: boolean;
  soloStockBajo?: boolean;
  sortBy?: string;
  isAscending?: boolean;
  page?: number;
}

export interface PagedResultDto<T> {
  items: T[];
  totalCount: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}
