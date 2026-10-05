import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaDto } from '../../../categorias/models/categoria.model';
import { ProductoFilterDto } from '../../models/producto.model';

@Component({
  selector: 'app-filtros-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filtros-card mb-3">
      <div class="row g-2 align-items-center">
        <!-- Búsqueda por texto (SKU o nombre) -->
        <div class="col-12 col-md-4">
          <div class="filtro-input-wrapper">
            <svg class="filtro-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              class="filtro-input"
              placeholder="Buscar por nombre o código..."
              [(ngModel)]="searchTerm"
              (keyup.enter)="onAplicar()"
            />
          </div>
        </div>

        <!-- Filtro por Categoría -->
        <div class="col-12 col-sm-6 col-md-3">
          <select class="filtro-select" [(ngModel)]="categoriaId" (ngModelChange)="onAplicar()">
            <option [ngValue]="null">Todas las categorías</option>
            @for (cat of categorias; track cat.id) {
              <option [ngValue]="cat.id">{{ cat.nombre }}</option>
            }
          </select>
        </div>

        <!-- Filtro por Estado -->
        <div class="col-6 col-sm-3 col-md-2">
          <select class="filtro-select" [(ngModel)]="isActive" (ngModelChange)="onAplicar()">
            <option [ngValue]="null">Todos los estados</option>
            <option [ngValue]="true">Activos</option>
            <option [ngValue]="false">Inactivos</option>
          </select>
        </div>

        <!-- Filtro Solo Stock Bajo -->
        <div class="col-6 col-sm-3 col-md-2">
          <label class="check-stock-bajo">
            <input
              type="checkbox"
              [(ngModel)]="soloStockBajo"
              (ngModelChange)="onAplicar()"
            />
            <span>Solo Stock Bajo</span>
          </label>
        </div>

        <!-- Botón Limpiar -->
        <div class="col-12 col-md-1 text-end">
          <button
            type="button"
            class="btn-limpiar"
            (click)="onLimpiar()"
            title="Limpiar filtros"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filtros-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      padding: 0.85rem 1.15rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    .filtro-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .filtro-icon {
      position: absolute;
      left: 0.75rem;
      width: 1rem;
      height: 1rem;
      color: #94a3b8;
      pointer-events: none;
    }

    .filtro-input, .filtro-select {
      width: 100%;
      height: 2.35rem;
      padding: 0 0.75rem 0 2.2rem;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 0.5rem;
      font-size: 0.82rem;
      color: #1e293b;
      transition: all 0.15s ease;
    }

    .filtro-select {
      padding-left: 0.75rem;
    }

    .filtro-input:focus, .filtro-select:focus {
      outline: none;
      background: #ffffff;
      border-color: #6366f1;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
    }

    .check-stock-bajo {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
      user-select: none;
      height: 2.35rem;
    }

    .check-stock-bajo input {
      accent-color: #f59e0b;
      width: 1rem;
      height: 1rem;
      cursor: pointer;
    }

    .btn-limpiar {
      background: transparent;
      border: none;
      color: #64748b;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0.35rem 0.5rem;
      border-radius: 0.35rem;
      transition: all 0.15s ease;
    }

    .btn-limpiar:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
  `]
})
export class FiltrosProductosComponent {
  @Input() categorias: CategoriaDto[] = [];

  @Output() filtrar = new EventEmitter<ProductoFilterDto>();
  @Output() limpiar = new EventEmitter<void>();

  searchTerm: string = '';
  categoriaId: number | null = null;
  isActive: boolean | null = null;
  soloStockBajo: boolean = false;

  onAplicar(): void {
    this.filtrar.emit({
      searchTerm: this.searchTerm.trim() || undefined,
      categoriaId: this.categoriaId ?? undefined,
      isActive: this.isActive ?? undefined,
      soloStockBajo: this.soloStockBajo || undefined,
    });
  }

  onLimpiar(): void {
    this.searchTerm = '';
    this.categoriaId = null;
    this.isActive = null;
    this.soloStockBajo = false;
    this.limpiar.emit();
  }
}
