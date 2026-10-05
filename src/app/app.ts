import { Component, computed, inject } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, filter } from 'rxjs';
import { AuthService } from './features/auth/services/auth.service';
import { SidebarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly urlActual = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** Solo mostrar layout limpio (sin sidebar) cuando estamos en login Y no autenticados */
  protected readonly enLogin = computed(() => {
    const url = this.urlActual();
    const auth = this.authService.estaAutenticado();
    // Si está autenticado, SIEMPRE mostrar el sidebar (nunca destruirlo)
    if (auth) return false;
    return url === '/' || url === '/login';
  });
}
