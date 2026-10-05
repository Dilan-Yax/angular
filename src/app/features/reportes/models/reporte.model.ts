export type TipoReporte = 'ventas' | 'cajas';
export type FormatoReporte = 'excel' | 'csv';

export interface ParametrosReporteDto {
  formato: FormatoReporte;
  desde?: string;
  hasta?: string;
}

export interface TarjetaReporteInfo {
  id: TipoReporte;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  badge: string;
  icono: string;
}
