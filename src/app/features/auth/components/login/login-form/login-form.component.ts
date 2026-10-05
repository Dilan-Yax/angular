import { Component, EventEmitter, Output, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login-form.html',
  styleUrl: '../login.css'
})
export class LoginFormComponent {
  enviando = input(false);
  error = input<string | null>(null);
  modoRegistro = input(false);

  @Output() onSubmit = new EventEmitter<{ userName: string; password: string }>();
  @Output() onAlternarModo = new EventEmitter<void>();

  readonly verPassword = signal(false);

  readonly formulario = new FormGroup({
    userName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  alternarModoLocal(): void {
    const passwordControl = this.formulario.controls.password;
    if (!this.modoRegistro()) {
      passwordControl.addValidators(Validators.minLength(8));
    } else {
      passwordControl.removeValidators(Validators.minLength(8));
    }
    passwordControl.updateValueAndValidity();
    this.verPassword.set(false);
    this.onAlternarModo.emit();
  }

  alternarVisibilidad(): void {
    this.verPassword.update((valor) => !valor);
  }

  enviarLocal(): void {
    if (this.formulario.invalid || this.enviando()) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.onSubmit.emit(this.formulario.getRawValue());
  }
}
