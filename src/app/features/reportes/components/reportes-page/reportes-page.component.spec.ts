import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ReportesPageComponent } from './reportes-page.component';
import { ReporteService } from '../../services/reporte.service';

describe('ReportesPageComponent', () => {
  let component: ReportesPageComponent;
  let fixture: ComponentFixture<ReportesPageComponent>;
  let reporteServiceMock: {
    descargarReporteVentas: ReturnType<typeof vi.fn>;
    descargarReporteCajas: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    reporteServiceMock = {
      descargarReporteVentas: vi.fn(),
      descargarReporteCajas: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ReportesPageComponent],
      providers: [{ provide: ReporteService, useValue: reporteServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
    expect(component.cargandoVentas()).toBe(false);
    expect(component.cargandoCajas()).toBe(false);
  });

  it('debe aplicar atajos de fechas correctamente', () => {
    component.aplicarAtajo('hoy');
    expect(component.fechaDesde).toBeTruthy();
    expect(component.fechaHasta).toBe(component.fechaDesde);

    component.limpiarFechas();
    expect(component.fechaDesde).toBe('');
    expect(component.fechaHasta).toBe('');
  });

  it('debe llamar a descargarReporteVentas y manejar éxito', async () => {
    reporteServiceMock.descargarReporteVentas.mockReturnValue(
      of(new Blob(['test'], { type: 'text/csv' }))
    );

    await component.exportarVentas('csv');

    expect(reporteServiceMock.descargarReporteVentas).toHaveBeenCalledWith({
      formato: 'csv',
      desde: undefined,
      hasta: undefined,
    });
    expect(component.cargandoVentas()).toBe(false);
    expect(component.alerta()?.tipo).toBe('exito');
  });

  it('debe manejar error 403 al exportar ventas', async () => {
    reporteServiceMock.descargarReporteVentas.mockReturnValue(
      throwError(() => ({ status: 403 }))
    );

    await component.exportarVentas('excel');

    expect(component.cargandoVentas()).toBe(false);
    expect(component.alerta()?.tipo).toBe('error');
    expect(component.alerta()?.mensaje).toContain('rol de Administrador');
  });

  it('debe llamar a descargarReporteCajas y manejar éxito', async () => {
    reporteServiceMock.descargarReporteCajas.mockReturnValue(
      of(new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
    );

    await component.exportarCajas('excel');

    expect(reporteServiceMock.descargarReporteCajas).toHaveBeenCalledWith({
      formato: 'excel',
      desde: undefined,
      hasta: undefined,
    });
    expect(component.cargandoCajas()).toBe(false);
    expect(component.alerta()?.tipo).toBe('exito');
  });

  it('debe manejar error genérico al exportar cajas', async () => {
    reporteServiceMock.descargarReporteCajas.mockReturnValue(
      throwError(() => new Error('Network error'))
    );

    await component.exportarCajas('csv');

    expect(component.cargandoCajas()).toBe(false);
    expect(component.alerta()?.tipo).toBe('error');
    expect(component.alerta()?.mensaje).toContain('No fue posible generar el reporte');
  });
});
