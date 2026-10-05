import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { VentaService } from './venta.service';
import { environment } from '../../../../environments/environment';

describe('VentaService', () => {
  let service: VentaService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        VentaService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(VentaService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('registrarVenta debe enviar un POST con los items a api/ventas', () => {
    const mockRequest = { items: [{ idProducto: 1, cantidad: 2 }] };
    const mockResponse = {
      id: 10,
      idUsuario: 1,
      fechaVenta: new Date().toISOString(),
      total: 50.0,
      isActive: true,
      detalles: [],
    };

    service.registrarVenta(mockRequest).subscribe((res) => {
      expect(res.id).toBe(10);
      expect(res.total).toBe(50.0);
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/ventas`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockResponse);
  });
});
