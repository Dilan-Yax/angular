import { Component, OnInit, inject, signal } from '@angular/core';
import { ClienteService } from '../../services/cliente.service';
import { Cliente, CrearClienteRequest } from '../../models/cliente.model';
import { ListaClientesComponent } from '../lista-clientes/lista-clientes.component';
import { FormularioClienteComponent } from '../formulario-cliente/formulario-cliente.component';

@Component({
  selector: 'app-clientes-page',
  standalone: true,
  imports: [ListaClientesComponent, FormularioClienteComponent],
  templateUrl: './clientes-page.html',
  styleUrl: './clientes-page.component.css',
})
export class ClientesPageComponent implements OnInit {
  private readonly clienteService = inject(ClienteService);

  readonly clientes = signal<Cliente[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly guardando = signal(false);
  readonly errorForm = signal<string | null>(null);
  readonly mostrarFormulario = signal(false);
  readonly clienteEnEdicion = signal<Cliente | null>(null);

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.loading.set(true);
    this.error.set(null);

    this.clienteService.getClientes().subscribe({
      next: (data) => {
        this.clientes.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los clientes.');
        this.loading.set(false);
      },
    });
  }

  onNuevo(): void {
    this.clienteEnEdicion.set(null);
    this.errorForm.set(null);
    this.mostrarFormulario.set(true);
  }

  onEditar(cliente: Cliente): void {
    this.clienteEnEdicion.set(cliente);
    this.errorForm.set(null);
    this.mostrarFormulario.set(true);
  }

  onCancelar(): void {
    this.mostrarFormulario.set(false);
    this.clienteEnEdicion.set(null);
    this.errorForm.set(null);
  }

  onGuardar(data: CrearClienteRequest): void {
    this.guardando.set(true);
    this.errorForm.set(null);

    const enEdicion = this.clienteEnEdicion();
    const peticion = enEdicion
      ? this.clienteService.actualizarCliente(enEdicion.id, data)
      : this.clienteService.crearCliente(data);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarFormulario.set(false);
        this.clienteEnEdicion.set(null);
        this.cargarClientes();
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorForm.set(err?.error?.detail ?? 'No se pudo guardar el cliente.');
      },
    });
  }

  onEliminar(cliente: Cliente): void {
    if (!window.confirm(`¿Eliminar al cliente "${cliente.nombre}"?`)) {
      return;
    }

    this.clienteService.eliminarCliente(cliente.id).subscribe({
      next: () => this.cargarClientes(),
      error: (err) => {
        this.error.set(err?.error?.detail ?? 'No se pudo eliminar el cliente.');
      },
    });
  }
}