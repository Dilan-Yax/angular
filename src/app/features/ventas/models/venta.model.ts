import { ProductoDto } from '../../productos/models/producto.model';

export interface ItemCarrito {
  producto: ProductoDto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface ItemVentaRequest {
  idProducto: number;
  cantidad: number;
}

export interface RegistrarVentaRequest {
  items: ItemVentaRequest[];
}

export interface VentaDetalleDto {
  id: number;
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface VentaDto {
  id: number;
  idUsuario: number;
  fechaVenta: string | Date;
  total: number;
  isActive: boolean;
  detalles: VentaDetalleDto[];
}
