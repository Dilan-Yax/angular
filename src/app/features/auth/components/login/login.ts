import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginFormComponent } from './login-form/login-form.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LoginFormComponent],
  template: `
    <app-login-form
      [enviando]="enviando()"
      [error]="error()"
      [modoRegistro]="modoRegistro()"
      (onSubmit)="enviar($event)"
      (onAlternarModo)="alternarModo()"
    ></app-login-form>
  `
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly modoRegistro = signal(false);
  readonly enviando = signal(false);
  readonly error = signal<string | null>(null);

  alternarModo(): void {
    this.modoRegistro.update((valor) => !valor);
    this.error.set(null);
  }

  enviar(credenciales: { userName: string; password: string }): void {
    this.enviando.set(true);
    this.error.set(null);

    const peticion$ = this.modoRegistro()
      ? this.authService.registro(credenciales)
      : this.authService.login(credenciales);

    peticion$.subscribe({
      next: () => {
        this.enviando.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.enviando.set(false);
        this.error.set(
          error?.error?.detail ??
            'No se pudo completar la operación. Verifica que el backend esté ejecutándose.'
        );
      },
    });
  }
}
