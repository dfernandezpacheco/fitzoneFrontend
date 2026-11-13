import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import {
  RecepcionService,
  CuotaRecepcion,
  ResumenCuotasRecepcion
} from '../../../services/recepcion';

type FiltroPago =
  | 'TODOS'
  | 'PAGADO'
  | 'PENDIENTE'
  | 'CANCELADO';

@Component({
  selector: 'app-recepcion-pagos',
  standalone: true,
  imports: [],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css'
})
export class RecepcionPagosComponent implements OnInit {

  private recepcionService = inject(RecepcionService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  usuario = sessionStorage.getItem('usuario') || 'Recepción';

  cuotas: CuotaRecepcion[] = [];
  resumen: ResumenCuotasRecepcion | null = null;

  cargando = true;
  error = '';
  mensaje = '';

  terminoBusqueda = '';
  filtroEstado: FiltroPago = 'TODOS';

  paginaActual = 0;
  tamanioPagina = 20;
  totalElementos = 0;
  totalPaginas = 0;

  cuotaProcesandoId: number | null = null;

  get inicialUsuario(): string {
    return this.usuario.charAt(0).toUpperCase();
  }

  get cuotasFiltradas(): CuotaRecepcion[] {

    const busqueda = this.terminoBusqueda
      .trim()
      .toLowerCase();

    return this.cuotas.filter(cuota => {

      const nombre =
        `${cuota.nombreSocio ?? ''} ${cuota.apellidosSocio ?? ''}`
          .toLowerCase();

      const coincideBusqueda =
        !busqueda ||
        nombre.includes(busqueda) ||
        (cuota.dni ?? '').toLowerCase().includes(busqueda) ||
        (cuota.nombrePlan ?? '').toLowerCase().includes(busqueda);

      const coincideEstado =
        this.filtroEstado === 'TODOS' ||
        cuota.estado.trim().toUpperCase() === this.filtroEstado;

      return coincideBusqueda && coincideEstado;

    });

  }

  get paginaVisible(): number {
    return this.totalPaginas > 0 ? this.paginaActual + 1 : 0;
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {

    this.cargando = true;
    this.error = '';

    forkJoin({
      pagina: this.recepcionService.listarCuotas(
        this.paginaActual,
        this.tamanioPagina
      ),
      resumen: this.recepcionService.obtenerResumenCuotas()
    }).subscribe({

      next: ({ pagina, resumen }) => {

        this.cuotas = pagina.content;
        this.totalElementos = pagina.totalElements;
        this.totalPaginas = pagina.totalPages;
        this.paginaActual = pagina.number;

        this.resumen = resumen;
        this.cargando = false;

        this.cdr.markForCheck();

      },

      error: error => {

        console.error('Error al cargar pagos:', error);

        this.error = 'No se pudieron cargar las cuotas.';

        this.cargando = false;

        this.cdr.markForCheck();

      }

    });

  }

  cambiarFiltro(filtro: FiltroPago): void {

    this.filtroEstado = filtro;
    this.cdr.markForCheck();

  }

  registrarPago(cuota: CuotaRecepcion): void {

    if (cuota.estado.trim().toUpperCase() !== 'PENDIENTE') {
      return;
    }

    const importe = this.formatearImporte(cuota.importe);

    const confirmado = window.confirm(
      `¿Confirmas el cobro de ${importe} correspondiente a ` +
      `${cuota.nombreSocio} ${cuota.apellidosSocio}, ` +
      `${this.formatearMes(cuota.mes)} de ${cuota.anio}?`
    );

    if (!confirmado) {
      return;
    }

    this.cuotaProcesandoId = cuota.id;
    this.error = '';
    this.mensaje = '';

    this.recepcionService.registrarPago(cuota.id).subscribe({

      next: () => {

        this.cuotaProcesandoId = null;

        this.mensaje =
          `Cobro de ${importe} registrado correctamente.`;

        // Recargar listado y contadores desde PostgreSQL.
        this.cargarDatos();

        this.cdr.markForCheck();

      },

      error: error => {

        console.error('Error al registrar el cobro:', error);

        this.cuotaProcesandoId = null;

        this.error =
          error.error?.detail ||
          error.error?.message ||
          'No se pudo registrar el cobro.';

        this.cdr.markForCheck();

      }

    });

  }

  paginaAnterior(): void {

    if (this.paginaActual > 0) {
      this.paginaActual--;
      this.cargarDatos();
    }

  }

  paginaSiguiente(): void {

    if (this.paginaActual + 1 < this.totalPaginas) {
      this.paginaActual++;
      this.cargarDatos();
    }

  }

  formatearMes(mes: number): string {

    const meses = [
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

    return meses[mes - 1] || 'Desconocido';

  }

  formatearImporte(importe: number): string {

    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(importe);

  }

  formatearFechaPago(cuota: CuotaRecepcion): string {

    if (cuota.estado.trim().toUpperCase() !== 'PAGADO') {
      return 'Sin cobrar';
    }

    if (!cuota.fechaPago) {
      return 'Fecha no disponible';
    }

    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(cuota.fechaPago));

  }

  volverDashboard(): void {
    this.router.navigate(['/recepcion/dashboard']);
  }

  cerrarSesion(): void {

    sessionStorage.clear();
    this.router.navigate(['/login']);

  }

}
