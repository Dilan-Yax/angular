import { Component, EventEmitter, Output, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CrearUsuarioRequest, ROLES, UsuarioDetalleDto } from '../../models/usuario.model';

type CampoFormulario = 'nombre' | 'apellido' | 'userName' | 'email' | 'rolId' | 'password';

@Component({
  selector: 'app-formulario-usuario',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './formulario-usuario.html',
  styleUrl: './formulario-usuario.css',
})
export class FormularioUsuarioComponent {
  usuario = input<UsuarioDetalleDto | null>(null);
  guardando = input(false);
  error = input<string | null>(null);

  @Output() guardar = new EventEmitter<CrearUsuarioRequest>();
  @Output() cancelar = new EventEmitter<void>();
  @Output() dirtyChange = new EventEmitter<boolean>();

  readonly roles = ROLES;

  readonly formulario: FormGroup;

  constructor() {
    const u = this.usuario();
    const inicial = u
      ? {
          nombre: u.nombre,
          apellido: u.apellido,
          userName: u.userName,
          email: u.email,
          rolId: u.idRol,
          password: '',
        }
      : { nombre: '', apellido: '', userName: '', email: '', rolId: null as number | null, password: '' };

    this.formulario = new FormGroup({
      nombre: new FormControl(inicial.nombre, {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      apellido: new FormControl(inicial.apellido, {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      userName: new FormControl(inicial.userName, {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
      }),
      email: new FormControl(inicial.email, {
        nonNullable: true,
        validators: [Validators.required, Validators.email, Validators.maxLength(150)],
      }),
      rolId: new FormControl<number | null>(inicial.rolId, {
        validators: [Validators.required],
      }),
      password: new FormControl('', { nonNullable: true }),
    });

    if (!u) {
      this.formulario.controls['password'].addValidators([
        Validators.required,
        Validators.minLength(8),
      ]);
    } else {
      this.formulario.controls['password'].disable();
    }

    this.formulario.valueChanges.subscribe(() => {
      this.dirtyChange.emit(this.formulario.dirty);
    });
  }

  esInvalido(campo: CampoFormulario): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && control.touched;
  }

  enviarLocal(): void {
    if (this.formulario.invalid || this.guardando()) {
      this.formulario.markAllAsTouched();
      return;
    }

    const raw = this.formulario.getRawValue();
    const datos: CrearUsuarioRequest = {
      nombre: raw.nombre.trim(),
      apellido: raw.apellido.trim(),
      userName: raw.userName.trim(),
      email: raw.email.trim(),
      rolId: raw.rolId!,
    };

    if (!this.usuario() && raw.password) {
      datos.password = raw.password;
    }

    this.guardar.emit(datos);
  }

  onCancelar(): void {
    if (this.formulario.dirty && !window.confirm('¿Descartar los cambios sin guardar?')) {
      return;
    }
    this.cancelar.emit();
  }
}