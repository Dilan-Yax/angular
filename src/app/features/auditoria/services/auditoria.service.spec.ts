import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuditoriaService } from './auditoria.service';
import { environment } from '../../../../environments/environment';
import { AuditLogDto, AuditLogFiltroDto } from '../models/auditoria.model';

describe('AuditoriaService', () => {
  let service: AuditoriaService;
  let httpTesting: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/audit-log`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuditoriaService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuditoriaService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('getAuditLogs debe enviar GET sin parámetros cuando no se pasa filtro', () => {
    const mockLogs: AuditLogDto[] = [
      {
        id: 1,
        usuario: 'admin',
        entidad: 'Producto',
        entidadId: '10',
        operacion: 'Update',
        valoresAnteriores: '{"Precio":10}',
        valoresNuevos: '{"Precio":15}',
        timestampUtc: new Date().toISOString(),
      },
    ];

    service.getAuditLogs().subscribe((res) => {
      expect(res.length).toBe(1);
      expect(res[0].usuario).toBe('admin');
      expect(res[0].entidad).toBe('Producto');
    });

    const req = httpTesting.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush(mockLogs);
  });

  it('getAuditLogs debe enviar GET con parámetros de usuario, entidad y fechas', () => {
    const filtro: AuditLogFiltroDto = {
      usuario: 'cajero1',
      entidad: 'Venta',
      desde: '2026-10-01',
      hasta: '2026-10-04',
    };

    const mockLogs: AuditLogDto[] = [
      {
        id: 2,
        usuario: 'cajero1',
        entidad: 'Venta',
        entidadId: '100',
        operacion: 'Insert',
        valoresAnteriores: null,
        valoresNuevos: '{"Total":250}',
        timestampUtc: '2026-10-02T10:00:00Z',
      },
    ];

    service.getAuditLogs(filtro).subscribe((res) => {
      expect(res.length).toBe(1);
      expect(res[0].operacion).toBe('Insert');
    });

    const req = httpTesting.expectOne((request) => {
      return (
        request.url === baseUrl &&
        request.params.get('usuario') === 'cajero1' &&
        request.params.get('entidad') === 'Venta' &&
        request.params.get('desde') === '2026-10-01' &&
        request.params.get('hasta') === '2026-10-04'
      );
    });

    expect(req.request.method).toBe('GET');
    req.flush(mockLogs);
  });
});
