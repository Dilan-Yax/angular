import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductoService } from './producto.service';
import { environment } from '../../../../environments/environment';
import {
  ActualizarProductoDto,
  CrearProductoDto,
  PagedResultDto,
  ProductoDetalleDto,
  ProductoDto,
} from '../models/producto.model';

describe('ProductoService', () => {
  let service: ProductoService;
  let httpTesting: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/productos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductoService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ProductoService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('getProductos debe enviar GET con parámetros de paginación y búsqueda', () => {
    const mockRes: PagedResultDto<ProductoDto> = {
      items: [
        {
          id: 1,
          codigo: 'PRD-001',
          nombre: 'Bebida Energética',
          precio: 15.5,
          stockActual: 20,
          stockMinimo: 5,
          stockBajo: false,
          isActive: true,
          idCategoria: 2,
          nombreCategoria: 'Bebidas',
        },
      ],
      totalCount: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };

    service
      .getProductos({ pageNumber: 1, pageSize: 10, searchTerm: 'Bebida', categoriaId: 2 })
      .subscribe((res) => {
        expect(res.items.length).toBe(1);
        expect(res.totalCount).toBe(1);
        expect(res.items[0].nombre).toBe('Bebida Energética');
      });

    const req = httpTesting.expectOne((request) => {
      return (
        request.url === baseUrl &&
        request.params.get('Page') === '1' &&
        request.params.get('PageSize') === '10' &&
        request.params.get('SearchTerm') === 'Bebida' &&
        request.params.get('CategoriaId') === '2'
      );
    });

    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('getProducto debe enviar GET a api/productos/:id', () => {
    const mockDetalle: ProductoDetalleDto = {
      id: 5,
      codigo: 'PRD-005',
      nombre: 'Galletas de Chocolate',
      descripcion: 'Caja con 12 paquetes',
      precio: 25.0,
      stockActual: 50,
      stockMinimo: 10,
      stockBajo: false,
      createdAtUtc: new Date().toISOString(),
      isActive: true,
      idCategoria: 3,
      nombreCategoria: 'Snacks',
      version: 2,
    };

    service.getProducto(5).subscribe((res) => {
      expect(res.id).toBe(5);
      expect(res.version).toBe(2);
      expect(res.nombre).toBe('Galletas de Chocolate');
    });

    const req = httpTesting.expectOne(`${baseUrl}/5`);
    expect(req.request.method).toBe('GET');
    req.flush(mockDetalle);
  });

  it('crearProducto debe enviar POST a api/productos', () => {
    const nuevoDto: CrearProductoDto = {
      codigo: 'PRD-010',
      nombre: 'Jugo Natural',
      idCategoria: 2,
      precio: 10.0,
      stockActual: 100,
      stockMinimo: 15,
    };

    const mockRes: ProductoDetalleDto = {
      id: 10,
      ...nuevoDto,
      stockBajo: false,
      createdAtUtc: new Date().toISOString(),
      isActive: true,
      nombreCategoria: 'Bebidas',
      version: 1,
    };

    service.crearProducto(nuevoDto).subscribe((res) => {
      expect(res.id).toBe(10);
      expect(res.codigo).toBe('PRD-010');
      expect(res.version).toBe(1);
    });

    const req = httpTesting.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(nuevoDto);
    req.flush(mockRes);
  });

  it('actualizarProducto debe enviar PUT con token de versión OCC a api/productos/:id', () => {
    const editDto: ActualizarProductoDto = {
      codigo: 'PRD-010',
      nombre: 'Jugo Natural Naranja',
      idCategoria: 2,
      precio: 12.0,
      stockActual: 95,
      stockMinimo: 15,
      version: 1,
    };

    const mockRes: ProductoDetalleDto = {
      id: 10,
      ...editDto,
      stockBajo: false,
      createdAtUtc: new Date().toISOString(),
      isActive: true,
      nombreCategoria: 'Bebidas',
      version: 2,
    };

    service.actualizarProducto(10, editDto).subscribe((res) => {
      expect(res.id).toBe(10);
      expect(res.version).toBe(2);
      expect(res.nombre).toBe('Jugo Natural Naranja');
    });

    const req = httpTesting.expectOne(`${baseUrl}/10`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.version).toBe(1);
    req.flush(mockRes);
  });

  it('desactivarProducto debe enviar DELETE a api/productos/:id', () => {
    service.desactivarProducto(10).subscribe();

    const req = httpTesting.expectOne(`${baseUrl}/10`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
