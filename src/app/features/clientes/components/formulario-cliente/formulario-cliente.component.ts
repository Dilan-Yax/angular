import { Component, EventEmitter, Output, input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Cliente, CrearClienteRequest } from '../../models/cliente.model';

@Component({
  selector: 'app-formulario-cliente',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-cliente.html',
  styleUrl: './formulario-cliente.css',
})
export class FormularioClienteComponent {
  cliente = input<Cliente | null>(null);
  guardando = input(false);
  error = input<string | null>(null);

  @Output() guardar = new EventEmitter<CrearClienteRequest>();
  @Output() cancelar = new EventEmitter<void>();

  readonly formulario = new FormGroup({
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    documento: new FormControl<string | null>(null, {
      validators: [Validators.maxLength(20)],
    }),
    telefono: new FormControl<string | null>(null, {
      validators: [Validators.maxLength(20)],
    }),
    email: new FormControl<string | null>(null, {
      validators: [Validators.email, Validators.maxLength(150)],
    }),
    direccion: new FormControl<string | null>(null, {
      validators: [Validators.maxLength(255)],
    }),
  });

  constructor() {
    const cliente = this.cliente();
    if (cliente) {
      this.formulario.patchValue({
        nombre: cliente.nombre,
        documento: cliente.documento,
        telefono: cliente.telefono,
        email: cliente.email,
        direccion: cliente.direccion,
      });
    }
  }

  esInvalido(campo: 'nombre' | 'documento' | 'telefono' | 'email' | 'direccion'): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && control.touched;
  }

  enviarLocal(): void {
    if (this.formulario.invalid || this.guardando()) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { nombre, documento, telefono, email, direccion } = this.formulario.getRawValue();
    this.guardar.emit({
      nombre,
      documento: documento || null,
      telefono: telefono || null,
      email: email || null,
      direccion: direccion || null,
    });
  }
}