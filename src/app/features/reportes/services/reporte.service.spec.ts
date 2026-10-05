import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReporteService } from './reporte.service';
import { environment } from '../../../../environments/environment';
import { HttpResponse } from '@angular/common/http';

describe('ReporteService', () => {
  let service: ReporteService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    // Mock URL object methods in test environment
    if (!window.URL.createObjectURL) {
      window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    } else {
      vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    }

    if (!window.URL.revokeObjectURL) {
      window.URL.revokeObjectURL = vi.fn();
    } else {
      vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});
    }

    TestBed.configureTestingModule({
      providers: [
        ReporteService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ReporteService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('descargarReporteVentas debe realizar GET a api/ventas/reporte con parámetros y blob', () => {
    const mockBlob = new Blob(['1,1,2026-10-04,5,500.00,Completada'], { type: 'text/csv' });

    service
      .descargarReporteVentas({
        formato: 'csv',
        desde: '2026-10-01',
        hasta: '2026-10-04',
      })
      .subscribe();

    const req = httpTesting.expectOne((request) => {
      return (
        request.url === `${environment.apiUrl}/ventas/reporte` &&
        request.params.get('formato') === 'csv' &&
        request.params.get('desde') === '2026-10-01' &&
        request.params.get('hasta') === '2026-10-04' &&
        request.responseType === 'blob'
      );
    });

    expect(req.request.method).toBe('GET');

    req.event(
      new HttpResponse<Blob>({
        body: mockBlob,
        headers: req.request.headers.set(
          'content-disposition',
          'attachment; filename="reporte_ventas_20261004.csv"'
        ),
        status: 200,
      })
    );
  });

  it('descargarReporteCajas debe realizar GET a api/cajas/reporte con formato excel', () => {
    const mockBlob = new Blob(['excel-binary-data'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    service
      .descargarReporteCajas({
        formato: 'excel',
      })
      .subscribe();

    const req = httpTesting.expectOne((request) => {
      return (
        request.url === `${environment.apiUrl}/cajas/reporte` &&
        request.params.get('formato') === 'excel' &&
        request.responseType === 'blob'
      );
    });

    expect(req.request.method).toBe('GET');

    req.event(
      new HttpResponse<Blob>({
        body: mockBlob,
        headers: req.request.headers.set(
          'content-disposition',
          'attachment; filename="reporte_cajas_20261004.xlsx"'
        ),
        status: 200,
      })
    );
  });
});
