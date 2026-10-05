export enum EstadoCajaSesion {
  Abierta = 1,
  Cerrada = 2,
}

export interface CajaSesionDto {
  id: number;
  idUsuario: number;
  nombreUsuario: string;
  fechaApertura: string | Date;
  fechaCierre?: string | Date | null;
  montoInicial: number;
  totalVentasEfectivo: number;
  totalVentasOtrosMedios: number;
  montoEsperado: number;
  montoReal?: number | null;
  diferencia?: number | null;
  estado: 'Abierta' | 'Cerrada' | string;
  observaciones?: string | null;
}

export interface EstadoCajaResponseDto {
  tieneCajaAbierta: boolean;
  cajaActual: CajaSesionDto | null;
}

export interface AbrirCajaDto {
  montoInicial: number;
  observaciones?: string;
}

export interface CerrarCajaDto {
  montoReal: number;
  observaciones?: string;
}

export interface CajaFiltroDto {
  fechaInicio?: string | Date;
  fechaFin?: string | Date;
  usuarioId?: number;
  estado?: string;
  page?: number;
  pageSize?: number;
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
