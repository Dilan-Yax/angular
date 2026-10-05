import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  imports: [],
  templateUrl: './lista-clientes.html',
  styleUrl: '../clientes-page/clientes-page.component.css',
})
export class ListaClientesComponent {
  @Input({ required: true }) clientes: Cliente[] = [];

  @Output() editarCliente = new EventEmitter<Cliente>();
  @Output() eliminarCliente = new EventEmitter<Cliente>();
}