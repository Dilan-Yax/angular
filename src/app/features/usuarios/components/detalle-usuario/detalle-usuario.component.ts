import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UsuarioDetalleDto } from '../../models/usuario.model';

@Component({
  selector: 'app-detalle-usuario',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './detalle-usuario.html',
  styleUrl: './detalle-usuario.css',
})
export class DetalleUsuarioComponent {
  @Input({ required: true }) usuario: UsuarioDetalleDto | null = null;

  @Output() cerrar = new EventEmitter<void>();

  onFondo(): void {
    this.cerrar.emit();
  }
}