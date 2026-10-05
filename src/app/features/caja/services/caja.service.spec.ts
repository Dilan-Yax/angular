import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CajaService } from './caja.service';
import { environment } from '../../../../environments/environment';

describe('CajaService', () => {
  let service: CajaService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CajaService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(CajaService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('getEstadoActual debe hacer GET a api/cajas/estado-actual', () => {
    const mockRes = { tieneCajaAbierta: false, cajaActual: null };

    service.getEstadoActual().subscribe((res) => {
      expect(res.tieneCajaAbierta).toBe(false);
      expect(res.cajaActual).toBeNull();
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/cajas/estado-actual`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRes);
  });

  it('abrirCaja debe hacer POST a api/cajas/abrir', () => {
    const mockDto = { montoInicial: 150.0, observaciones: 'Apertura de turno' };
    const mockRes = {
      id: 1,
      idUsuario: 1,
      nombreUsuario: 'admin',
      fechaApertura: new Date().toISOString(),
      montoInicial: 150.0,
      totalVentasEfectivo: 0,
      totalVentasOtrosMedios: 0,
      montoEsperado: 150.0,
      estado: 'Abierta',
    };

    service.abrirCaja(mockDto).subscribe((res) => {
      expect(res.id).toBe(1);
      expect(res.montoInicial).toBe(150.0);
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/cajas/abrir`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockDto);
    req.flush(mockRes);
  });

  it('cerrarCaja debe hacer POST a api/cajas/:id/cerrar', () => {
    const mockDto = { montoReal: 200.0, observaciones: 'Cierre de turno' };
    const mockRes = {
      id: 1,
      idUsuario: 1,
      nombreUsuario: 'admin',
      fechaApertura: new Date().toISOString(),
      montoInicial: 150.0,
      totalVentasEfectivo: 50.0,
      totalVentasOtrosMedios: 0,
      montoEsperado: 200.0,
      montoReal: 200.0,
      diferencia: 0,
      estado: 'Cerrada',
    };

    service.cerrarCaja(1, mockDto).subscribe((res) => {
      expect(res.estado).toBe('Cerrada');
      expect(res.diferencia).toBe(0);
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/cajas/1/cerrar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockDto);
    req.flush(mockRes);
  });
});
