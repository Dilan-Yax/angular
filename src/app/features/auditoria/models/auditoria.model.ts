export interface AuditLogDto {
  id: number;
  usuario: string | null;
  entidad: string;
  entidadId: string;
  operacion: string;
  valoresAnteriores: string | null;
  valoresNuevos: string | null;
  timestampUtc: string;
}

export interface AuditLogFiltroDto {
  usuario?: string;
  entidad?: string;
  desde?: string;
  hasta?: string;
}
