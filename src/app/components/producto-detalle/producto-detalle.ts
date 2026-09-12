import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-producto-detalle',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './producto-detalle.html',
  styleUrl: './producto-detalle.css',
})
export class ProductoDetalle {
  private readonly route = inject(ActivatedRoute);
  private readonly productoService = inject(ProductoService);

  private readonly id = computed(() => Number(this.route.snapshot.paramMap.get('id')));

  readonly producto = computed(() =>
    this.productoService.obtenerPorId(this.id()),
  );
}