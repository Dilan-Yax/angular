export interface UsuarioDto {
  id: number;
  userName: string;
  nombre: string;
  apellido: string;
  email: string;
  rolNombre: string;
  isActive: boolean;
  ultimoLogin: string | null;
  createdAtUtc: string;
}

export interface UsuarioDetalleDto {
  id: number;
  userName: string;
  nombre: string;
  apellido: string;
  email: string;
  idRol: number;
  rolNombre: string;
  isActive: boolean;
  ultimoLogin: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
}

export interface PagedResultDto<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/** Campos de ordenamiento soportados por la tabla/back-end. */
export type CampoOrden = 'nombre' | 'username' | 'rol' | 'fecha';

export interface UsuarioFilterDto {
  searchTerm?: string | null;
  rolId?: number | null;
  isActive?: boolean | null;
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  sortBy?: CampoOrden | null;
  isAscending: boolean;
  page: number;
  pageSize: number;
}

/** Filtros emitidos por la barra de filtros (sin paginación/orden). */
export interface FiltrosUsuariosRequest {
  searchTerm: string | null;
  rolId: number | null;
  isActive: boolean | null;
  fechaDesde: string | null;
  fechaHasta: string | null;
}

export interface CrearUsuarioRequest {
  nombre: string;
  apellido: string;
  userName: string;
  email: string;
  rolId: number;
  password?: string;
}

export interface RoleOption {
  id: number;
  nombre: string;
}

/** Roles sembrados por el backend (seed `pos_inventario`). */
export const ROLES: RoleOption[] = [
  { id: 1, nombre: 'Admin' },
  { id: 2, nombre: 'Cajero' },
];