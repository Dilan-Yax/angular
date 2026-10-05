import { Component, OnInit, inject, signal } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';
import {
  CrearUsuarioRequest,
  FiltrosUsuariosRequest,
  UsuarioDetalleDto,
  UsuarioDto,
  UsuarioFilterDto,
  CampoOrden,
} from '../../models/usuario.model';
import { FiltrosUsuariosComponent } from '../filtros-usuarios/filtros-usuarios.component';
import { TablaUsuariosComponent } from '../tabla-usuarios/tabla-usuarios.component';
import { DetalleUsuarioComponent } from '../detalle-usuario/detalle-usuario.component';
import { PaginadorComponent } from '../paginador/paginador.component';
import { FormularioUsuarioComponent } from '../formulario-usuario/formulario-usuario.component';

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [
    FiltrosUsuariosComponent,
    TablaUsuariosComponent,
    DetalleUsuarioComponent,
    PaginadorComponent,
    FormularioUsuarioComponent,
  ],
  templateUrl: './usuarios-page.html',
  styleUrl: './usuarios-page.component.css',
})
export class UsuariosPageComponent implements OnInit {
  private readonly usuariosService = inject(UsuariosService);

  /* ── Estado de la lista ─────────────────────────────── */
  readonly usuarios = signal<UsuarioDto[]>([]);
  readonly totalItems = signal(0);
  readonly totalPages = signal(1);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly filtros = signal<UsuarioFilterDto>({
    page: 1,
    pageSize: 10,
    isAscending: true,
  });

  /* ── Exportación ────────────────────────────────────── */
  readonly exportando = signal<'excel' | 'csv' | null>(null);

  /* ── Detalle (modal) ────────────────────────────────── */
  readonly mostrarDetalle = signal(false);
  readonly usuarioDetalle = signal<UsuarioDetalleDto | null>(null);

  /* ── Formulario crear/editar ────────────────────────── */
  readonly mostrarFormulario = signal(false);
  readonly usuarioEnEdicion = signal<UsuarioDetalleDto | null>(null);
  readonly guardando = signal(false);
  readonly errorForm = signal<string | null>(null);
  readonly formularioDirty = signal(false);

  /* ── Desactivar en curso ────────────────────────────── */
  readonly desactivandoId = signal<number | null>(null);

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.usuariosService.obtenerPaginado(this.filtros()).subscribe({
      next: (resultado) => {
        this.usuarios.set(resultado.items);
        this.totalItems.set(resultado.totalCount);
        this.totalPages.set(resultado.totalPages);
        this.cargando.set(false);
      },
      error: () => {
        this.usuarios.set([]);
        this.totalItems.set(0);
        this.totalPages.set(1);
        this.cargando.set(false);
        this.error.set('Error al cargar los usuarios.');
      },
    });
  }

  /* ── Filtros / orden / paginación ───────────────────── */
  onAplicarFiltros(filtros: FiltrosUsuariosRequest): void {
    this.filtros.update((actual) => ({ ...actual, ...filtros, page: 1 }));
    this.cargarUsuarios();
  }

  onLimpiarFiltros(): void {
    this.filtros.set({
      page: 1,
      pageSize: this.filtros().pageSize,
      isAscending: true,
    });
    this.cargarUsuarios();
  }

  onOrdenar(campo: CampoOrden): void {
    const actual = this.filtros();
    const esElMismoCampo = actual.sortBy === campo;
    this.filtros.update((f) => ({
      ...f,
      sortBy: campo,
      isAscending: esElMismoCampo ? !f.isAscending : true,
    }));
    this.cargarUsuarios();
  }

  onCambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPages()) {
      return;
    }
    this.filtros.update((f) => ({ ...f, page: pagina }));
    this.cargarUsuarios();
  }

  onCambiarTamano(tamano: number): void {
    this.filtros.update((f) => ({ ...f, pageSize: tamano, page: 1 }));
    this.cargarUsuarios();
  }

  /* ── Exportación ────────────────────────────────────── */
  onExportar(formato: 'excel' | 'csv'): void {
    if (this.exportando()) {
      return;
    }

    this.exportando.set(formato);
    this.usuariosService.descargarReporte(this.filtros(), formato).subscribe({
      next: () => this.exportando.set(null),
      error: () => {
        this.exportando.set(null);
        this.error.set('No se pudo generar el reporte.');
      },
    });
  }

  /* ── Detalle (modal) ────────────────────────────────── */
  onVerDetalle(id: number): void {
    this.usuariosService.obtenerDetalle(id).subscribe({
      next: (usuario) => {
        this.usuarioDetalle.set(usuario);
        this.mostrarDetalle.set(true);
      },
      error: () => this.error.set('No se pudo cargar el detalle del usuario.'),
    });
  }

  onCerrarDetalle(): void {
    this.mostrarDetalle.set(false);
    this.usuarioDetalle.set(null);
  }

  /* ── Formulario crear/editar ────────────────────────── */
  onNuevo(): void {
    this.usuarioEnEdicion.set(null);
    this.errorForm.set(null);
    this.formularioDirty.set(false);
    this.mostrarFormulario.set(true);
  }

  onEditar(usuario: UsuarioDto): void {
    this.usuariosService.obtenerDetalle(usuario.id).subscribe({
      next: (detalle) => {
        this.usuarioEnEdicion.set(detalle);
        this.errorForm.set(null);
        this.formularioDirty.set(false);
        this.mostrarFormulario.set(true);
      },
      error: () => this.error.set('No se pudo cargar el usuario para editar.'),
    });
  }

  onCancelarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.usuarioEnEdicion.set(null);
    this.formularioDirty.set(false);
    this.errorForm.set(null);
  }

  onGuardar(datos: CrearUsuarioRequest): void {
    this.guardando.set(true);
    this.errorForm.set(null);

    const enEdicion = this.usuarioEnEdicion();
    const peticion = enEdicion
      ? this.usuariosService.actualizarUsuario(enEdicion.id, datos)
      : this.usuariosService.crearUsuario(datos);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.onCancelarFormulario();
        this.cargarUsuarios();
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorForm.set(err?.error?.detail ?? 'No se pudo guardar el usuario.');
      },
    });
  }

  onDirtyChange(dirty: boolean): void {
    this.formularioDirty.set(dirty);
  }

  /* ── Desactivar ─────────────────────────────────────── */
  onDesactivar(usuario: UsuarioDto): void {
    if (!window.confirm(`¿Desactivar al usuario "${usuario.nombre} ${usuario.apellido}"?`)) {
      return;
    }

    this.desactivandoId.set(usuario.id);
    this.usuariosService.desactivarUsuario(usuario.id).subscribe({
      next: () => {
        this.desactivandoId.set(null);
        this.cargarUsuarios();
      },
      error: (err) => {
        this.desactivandoId.set(null);
        this.error.set(err?.error?.detail ?? 'No se pudo desactivar el usuario.');
      },
    });
  }

  /** Consultada por el guard `salirConFormularioLimpio`. */
  tieneCambiosSinGuardar(): boolean {
    return this.mostrarFormulario() && this.formularioDirty();
  }
}

/** Evita salir de la ruta con cambios sin guardar en el formulario. */
export const salirConFormularioLimpio: CanDeactivateFn<UsuariosPageComponent> = (componente) => {
  if (componente.tieneCambiosSinGuardar()) {
    return window.confirm(
      'Tiene cambios sin guardar en el formulario de usuario. ¿Desea salir sin guardar?',
    );
  }
  return true;
};