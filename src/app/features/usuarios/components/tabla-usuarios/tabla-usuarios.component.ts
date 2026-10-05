import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CampoOrden, UsuarioDto } from '../../models/usuario.model';

@Component({
  selector: 'app-tabla-usuarios',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './tabla-usuarios.html',
  styleUrl: '../usuarios-page/usuarios-page.component.css',
})
export class TablaUsuariosComponent {
  @Input({ required: true }) usuarios: UsuarioDto[] = [];
  @Input() sortBy: CampoOrden | null = null;
  @Input() isAscending = true;
  @Input() desactivandoId: number | null = null;

  @Output() ordenar = new EventEmitter<CampoOrden>();
  @Output() verDetalle = new EventEmitter<number>();
  @Output() editar = new EventEmitter<UsuarioDto>();
  @Output() desactivar = new EventEmitter<UsuarioDto>();

  indicadorSort(campo: CampoOrden): string {
    if (this.sortBy !== campo) {
      return '';
    }
    return this.isAscending ? '▲' : '▼';
  }

  ariaSort(campo: CampoOrden): string | null {
    if (this.sortBy !== campo) {
      return null;
    }
    return this.isAscending ? 'ascending' : 'descending';
  }
}