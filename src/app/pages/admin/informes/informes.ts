import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { Router } from '@angular/router';

import {
  AdminService,
  InformeAdmin
} from '../../../services/admin';

@Component({
  selector: 'app-admin-informes',
  standalone: true,
  imports: [],
  templateUrl: './informes.html',
  styleUrl: './informes.css'
})
export class AdminInformesComponent implements OnInit {

  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  usuario = sessionStorage.getItem('usuario') || 'Administrador';

  anioSeleccionado = new Date().getFullYear();

  aniosDisponibles: number[] = Array.from(
    { length: new Date().getFullYear() - 2020 + 1 },
    (_, i) => new Date().getFullYear() - i
  );

  informe: InformeAdmin | null = null;

  cargando = true;
  error = '';

  meses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ];

  get inicialUsuario(): string {
    return this.usuario.charAt(0).toUpperCase();
  }

  get ingresosAnuales(): string {

    if (!this.informe) {
      return '—';
    }

    return this.formatearEuro(this.informe.ingresosAnio);

  }

  get totalCuotas(): number {
    return this.informe?.totalCuotas ?? 0;
  }

  get porcentajePagadas(): number {

    if (!this.informe || this.informe.totalCuotas === 0) {
      return 0;
    }

    return Math.round(
      (this.informe.cuotasPagadas / this.informe.totalCuotas) * 100
    );

  }

  get porcentajePendientes(): number {

    if (!this.informe || this.informe.totalCuotas === 0) {
      return 0;
    }

    return Math.round(
      (this.informe.cuotasPendientes / this.informe.totalCuotas) * 100
    );

  }

  get porcentajeCanceladas(): number {

    if (!this.informe || this.informe.totalCuotas === 0) {
      return 0;
    }

    return Math.round(
      (this.informe.cuotasCanceladas / this.informe.totalCuotas) * 100
    );

  }

  get maximoIngresosMensuales(): number {

    if (!this.informe) {
      return 0;
    }

    return Math.max(
      ...this.informe.ingresosMensuales.map(m => m.ingresos),
      0
    );

  }

  get maximoAltasMensuales(): number {

    if (!this.informe) {
      return 0;
    }

    return Math.max(
      ...this.informe.altasMensuales.map(m => m.altas),
      0
    );
  }

  obtenerAlturaBarraAltas(altas: number): number {

    if (this.maximoAltasMensuales === 0) {
      return 0;
    }

    return Math.round(
      (altas / this.maximoAltasMensuales) * 100
    );
  }

  ngOnInit(): void {
    this.cargarInforme();
  }

  cargarInforme(): void {

    this.cargando = true;
    this.error = '';

    this.adminService.obtenerInforme(
      this.anioSeleccionado
    ).subscribe({

      next: datos => {

        this.informe = datos;
        this.cargando = false;

        console.log('Informe administrativo:', datos);

        this.cdr.markForCheck();

      },

      error: error => {

        console.error('Error al cargar el informe:', error);

        this.error =
          'No se pudo cargar el informe. Comprueba la conexión con el servidor.';

        this.informe = null;
        this.cargando = false;

        this.cdr.markForCheck();

      }

    });

  }

  cambiarAnio(event: Event): void {

    const valor = (event.target as HTMLSelectElement).value;
    const anio = Number(valor);

    if (!Number.isInteger(anio) || anio < 2000) {
      return;
    }

    this.anioSeleccionado = anio;
    this.cargarInforme();

  }

  formatearEuro(importe: number): string {

    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(importe);

  }

  obtenerNombreMes(numeroMes: number): string {

    return this.meses[numeroMes - 1] || 'Desconocido';

  }

  obtenerAnchoBarra(ingresos: number): number {

    if (this.maximoIngresosMensuales <= 0) {
      return 0;
    }

    return Math.round(
      (ingresos / this.maximoIngresosMensuales) * 100
    );

  }

  descargarCSV(): void {

    if (!this.informe) {
      return;
    }

    const filas: string[][] = [

      ['INFORME FITZONE'],
      ['AÑO', String(this.informe.anio)],
      [],
      ['RESUMEN ECONÓMICO'],
      ['Ingresos anuales', String(this.informe.ingresosAnio)],
      ['Total cuotas', String(this.informe.totalCuotas)],
      ['Cuotas pagadas', String(this.informe.cuotasPagadas)],
      ['Cuotas pendientes', String(this.informe.cuotasPendientes)],
      ['Cuotas canceladas', String(this.informe.cuotasCanceladas)],
      [],
      ['DESGLOSE MENSUAL'],
      ['Mes', 'Ingresos (€)']


    ];
    filas.push(
      [],
      ['ALTAS DE SOCIOS'],
      ['Mes', 'Nuevas altas']
    );

    this.informe.altasMensuales.forEach(mes => {

      filas.push([
        this.obtenerNombreMes(mes.mes),
        String(mes.altas)
      ]);

    });

    this.informe.ingresosMensuales.forEach(mes => {

      filas.push([
        this.obtenerNombreMes(mes.mes),
        String(mes.ingresos)
      ]);

    });

    const contenido = filas
      .map(fila =>
        fila.map(valor => {
          const escapado = valor.replace(/"/g, '""');
          return `"${escapado}"`;
        }).join(';')
      )
      .join('\r\n');

    const blob = new Blob(
      ['\uFEFF', contenido],
      { type: 'text/csv;charset=utf-8;' }
    );

    const url = URL.createObjectURL(blob);

    const enlace = document.createElement('a');

    enlace.href = url;

    enlace.download = `fitzone_informe_${this.informe.anio}.csv`;

    document.body.appendChild(enlace);

    enlace.click();

    enlace.remove();

    URL.revokeObjectURL(url);

  }

  volverDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  cerrarSesion(): void {

    sessionStorage.clear();

    this.router.navigate(['/login']);

  }

}
