export interface Producto {
  id: number;
  nombre: string;
  precio: number;
}

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
