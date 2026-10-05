import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-paginador',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './paginador.html',
  styleUrl: './paginador.css',
})
export class PaginadorComponent {
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() totalItems = 0;
  @Input() totalPages = 1;

  @Output() cambiarPagina = new EventEmitter<number>();
  @Output() cambiarTamano = new EventEmitter<number>();

  readonly opcionesTamano = [5, 10, 20, 50];

  rangoInfo(): string {
    if (this.totalItems === 0) {
      return '0 registros';
    }
    const desde = (this.page - 1) * this.pageSize + 1;
    const hasta = Math.min(this.page * this.pageSize, this.totalItems);
    return `${desde}–${hasta} de ${this.totalItems}`;
  }

  onCambiarTamano(evento: Event): void {
    const valor = Number((evento.target as HTMLSelectElement).value);
    if (Number.isFinite(valor) && valor > 0) {
      this.cambiarTamano.emit(valor);
    }
  }
}