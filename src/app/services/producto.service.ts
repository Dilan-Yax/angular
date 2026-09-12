import { Injectable, signal } from '@angular/core';
import { Producto } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly productos = signal<Producto[]>([
    {
      id: 1,
      nombre: 'Laptop HP Pavilion',
      descripcion: 'Laptop de 14 pulgadas con 16 GB de RAM.',
      precio: 18500,
      categoria: 'Computación',
      stock: 12,
      estado: 'disponible',
    },
    {
      id: 2,
      nombre: 'Mouse Inalámbrico',
      descripcion: 'Mouse ergonómico con conexión Bluetooth 5.0.',
      precio: 450,
      categoria: 'Accesorios',
      stock: 45,
      estado: 'disponible',
    },
    {
      id: 3,
      nombre: 'Teclado Mecánico',
      descripcion: 'Teclado mecánico RGB con switches blue.',
      precio: 1200,
      categoria: 'Accesorios',
      stock: 0,
      estado: 'agotado',
    },
    {
      id: 4,
      nombre: 'Monitor Samsung 24"',
      descripcion: 'Monitor Full HD con panel IPS y 75 Hz.',
      precio: 3200,
      categoria: 'Computación',
      stock: 8,
      estado: 'disponible',
    },
    {
      id: 5,
      nombre: 'Audífonos Sony',
      descripcion: 'Audífonos inalámbricos con cancelación de ruido.',
      precio: 2300,
      categoria: 'Audio',
      stock: 0,
      estado: 'agotado',
    },
  ]);

  readonly productosSignal = this.productos.asReadonly();

  obtenerPorId(id: number): Producto | undefined {
    return this.productos().find((p) => p.id === Number(id));
  }
}