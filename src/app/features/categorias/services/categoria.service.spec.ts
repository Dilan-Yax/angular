import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CategoriaService } from './categoria.service';
import { environment } from '../../../../environments/environment';
import { CategoriaDto, CrearCategoriaDto } from '../models/categoria.model';

describe('CategoriaService', () => {
  let service: CategoriaService;
  let httpTesting: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/categorias`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CategoriaService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(CategoriaService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('getCategorias debe enviar GET a api/categorias', () => {
    const mockList: CategoriaDto[] = [
      { id: 1, nombre: 'Bebidas', descripcion: 'Refrescos y jugos', isActive: true },
      { id: 2, nombre: 'Snacks', descripcion: 'Botanas', isActive: true },
    ];

    service.getCategorias().subscribe((res) => {
      expect(res.length).toBe(2);
      expect(res[0].nombre).toBe('Bebidas');
    });

    const req = httpTesting.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockList);
  });

  it('getCategoria debe enviar GET a api/categorias/:id', () => {
    const mockCat: CategoriaDto = {
      id: 1,
      nombre: 'Bebidas',
      descripcion: 'Refrescos y jugos',
      isActive: true,
    };

    service.getCategoria(1).subscribe((res) => {
      expect(res.id).toBe(1);
      expect(res.nombre).toBe('Bebidas');
    });

    const req = httpTesting.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCat);
  });

  it('crearCategoria debe enviar POST a api/categorias', () => {
    const nuevoDto: CrearCategoriaDto = {
      nombre: 'Lácteos',
      descripcion: 'Leches y quesos',
    };

    const mockRes: CategoriaDto = {
      id: 3,
      ...nuevoDto,
      isActive: true,
    };

    service.crearCategoria(nuevoDto).subscribe((res) => {
      expect(res.id).toBe(3);
      expect(res.nombre).toBe('Lácteos');
    });

    const req = httpTesting.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(nuevoDto);
    req.flush(mockRes);
  });

  it('desactivarCategoria debe enviar DELETE a api/categorias/:id', () => {
    service.desactivarCategoria(3).subscribe();

    const req = httpTesting.expectOne(`${baseUrl}/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
