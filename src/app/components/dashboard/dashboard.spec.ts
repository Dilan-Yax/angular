import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Dashboard } from './dashboard';
import { AuthService } from '../../features/auth/services/auth.service';
import { ProductoService } from '../../features/productos/services/producto.service';
import { CajaService } from '../../features/caja/services/caja.service';
import { PagedResultDto, ProductoDto } from '../../features/productos/models/producto.model';
import { EstadoCajaResponseDto } from '../../features/caja/models/caja.model';
import { signal } from '@angular/core';

describe('Dashboard', () => {
  let component: Dashboard;

  const mockProductos: PagedResultDto<ProductoDto> = {
    items: [
      {
        id: 1,
        nombre: 'Laptop HP Pavilion',
        descripcion: '16 GB RAM',
        precio: 5000,
        stockActual: 10,
        stockMinimo: 3,
        idCategoria: 1,
        nombreCategoria: 'Computación',
        isActive: true,
      },
      {
        id: 2,
        nombre: 'Mouse Inalámbrico',
        descripcion: 'Bluetooth',
        precio: 200,
        stockActual: 0,
        stockMinimo: 5,
        idCategoria: 2,
        nombreCategoria: 'Accesorios',
        isActive: true,
      },
    ],
    totalCount: 2,
  };

  const mockStockBajo: PagedResultDto<ProductoDto> = {
    items: [
      {
        id: 2,
        nombre: 'Mouse Inalámbrico',
        descripcion: 'Bluetooth',
        precio: 200,
        stockActual: 0,
        stockMinimo: 5,
        stockBajo: true,
        idCategoria: 2,
        nombreCategoria: 'Accesorios',
        isActive: true,
      },
    ],
    totalCount: 1,
  };

  const mockCaja: EstadoCajaResponseDto = {
    tieneCajaAbierta: true,
    cajaActual: {
      id: 1,
      idUsuario: 1,
      nombreUsuario: 'admin',
      fechaApertura: '2026-10-04T08:00:00Z',
      montoInicial: 200,
      totalVentasEfectivo: 1450.5,
      totalVentasOtrosMedios: 350.0,
      montoEsperado: 1650.5,
      estado: 'Abierta',
    },
  };

  const mockAuthService = {
    usuarioActual: signal({ userName: 'admin', role: 'Admin', permisos: [] }),
  };

  const mockProductoService = {
    getProductos: vi.fn((filtro) => {
      if (filtro?.soloStockBajo) {
        return of(mockStockBajo);
      }
      return of(mockProductos);
    }),
  };

  const mockCajaService = {
    getEstadoActual: vi.fn(() => of(mockCaja)),
  };

  beforeEach(async () => {
    mockProductoService.getProductos.mockClear();
    mockCajaService.getEstadoActual.mockClear();

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ProductoService, useValue: mockProductoService },
        { provide: CajaService, useValue: mockCajaService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe consultar productos generales, stock bajo y estado de caja en ngOnInit', async () => {
    await component.cargarDatos();

    expect(mockProductoService.getProductos).toHaveBeenCalledWith(
      expect.objectContaining({ pageSize: 100 })
    );
    expect(mockProductoService.getProductos).toHaveBeenCalledWith(
      expect.objectContaining({ soloStockBajo: true, pageSize: 50 })
    );
    expect(mockCajaService.getEstadoActual).toHaveBeenCalled();

    // Comprobación de cálculos
    expect(component.totalProductos()).toBe(2);
    expect(component.disponibles()).toBe(1);
    expect(component.agotados()).toBe(1);

    // Valor del inventario: (5000 * 10) + (200 * 0) = 50000
    expect(component.valorInventario()).toBe(50000);

    // Stock Total: 10 + 0 = 10
    expect(component.stockTotal()).toBe(10);

    // Alerta de reposición: alimentada por soloStockBajo (1 producto)
    expect(component.alertaStock().length).toBe(1);
    expect(component.alertaStock()[0].nombre).toBe('Mouse Inalámbrico');

    // KPI de Caja: ventas en efectivo turno activo
    expect(component.ventasEfectivoTurno()).toBe(1450.5);
    expect(component.tieneCajaAbierta()).toBe(true);
  });
});
