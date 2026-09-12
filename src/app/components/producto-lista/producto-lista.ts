import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-producto-lista',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './producto-lista.html',
  styleUrl: './producto-lista.css',
})
export class ProductoLista {
  private readonly productoService = inject(ProductoService);

  readonly productos = this.productoService.productosSignal;
}