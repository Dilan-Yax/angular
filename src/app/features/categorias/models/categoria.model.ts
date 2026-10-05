export interface CategoriaDto {
  id: number;
  nombre: string;
  descripcion?: string | null;
  isActive: boolean;
}

export interface CrearCategoriaDto {
  nombre: string;
  descripcion?: string | null;
}

export interface ActualizarCategoriaDto {
  nombre: string;
  descripcion?: string | null;
}
