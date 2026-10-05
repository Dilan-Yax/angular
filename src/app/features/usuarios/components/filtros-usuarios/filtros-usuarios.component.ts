import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FiltrosUsuariosRequest, ROLES } from '../../models/usuario.model';

@Component({
  selector: 'app-filtros-usuarios',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './filtros-usuarios.html',
  styleUrl: '../usuarios-page/usuarios-page.component.css',
})
export class FiltrosUsuariosComponent {
  readonly roles = ROLES;

  @Output() aplicarFiltros = new EventEmitter<FiltrosUsuariosRequest>();
  @Output() limpiarFiltros = new EventEmitter<void>();

  readonly formulario = new FormGroup({
    searchTerm: new FormControl('', { nonNullable: true }),
    rolId: new FormControl<number | null>(null),
    isActive: new FormControl<string>('', { nonNullable: true }),
    fechaDesde: new FormControl<string | null>(null),
    fechaHasta: new FormControl<string | null>(null),
  });

  enviar(): void {
    const raw = this.formulario.getRawValue();

    this.aplicarFiltros.emit({
      searchTerm: raw.searchTerm.trim() || null,
      rolId: raw.rolId ?? null,
      isActive: raw.isActive === '' ? null : raw.isActive === 'true',
      fechaDesde: raw.fechaDesde || null,
      fechaHasta: raw.fechaHasta || null,
    });
  }

  limpiar(): void {
    this.formulario.reset({
      searchTerm: '',
      rolId: null,
      isActive: '',
      fechaDesde: null,
      fechaHasta: null,
    });
    this.limpiarFiltros.emit();
  }
}