import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import {
  AdminService,
  CuotaAdmin,
  AdminResumen
} from '../../../services/admin';

type FiltroCuota =
  | 'TODOS'
  | 'PAGADO'
  | 'PENDIENTE'
  | 'CANCELADO';

@Component({
  selector: 'app-admin-cuotas',
  standalone: true,
  imports: [],
  templateUrl: './cuotas.html',
  styleUrl: './cuotas.css'
})
export class AdminCuotasComponent implements OnInit {

  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  usuario = sessionStorage.getItem('usuario') || 'Administrador';

  cuotas: CuotaAdmin[] = [];

  resumen: AdminResumen | null = null;

  cargando = true;
  error = '';

  terminoBusqueda = '';

  filtroEstado: FiltroCuota = 'TODOS';

  paginaActual = 0;
  tamanioPagina = 20;

  totalElementos = 0;
  totalPaginas = 0;

  get inicialUsuario(): string {
    return this.usuario.charAt(0).toUpperCase();
  }

  get cuotasFiltradas(): CuotaAdmin[] {

    const busqueda = this.terminoBusqueda
      .trim()
      .toLowerCase();

    return this.cuotas.filter(cuota => {

      const nombreCompleto =
        `${cuota.nombreSocio} ${cuota.apellidosSocio}`.toLowerCase();

      const coincideBusqueda =
        !busqueda ||
        nombreCompleto.includes(busqueda) ||
        (cuota.dni || '').toLowerCase().includes(busqueda) ||
        (cuota.nombrePlan || '').toLowerCase().includes(busqueda);

      const estado = cuota.estado.trim().toUpperCase();

      const coincideEstado =
        this.filtroEstado === 'TODOS' ||
        estado === this.filtroEstado;

      return coincideBusqueda && coincideEstado;

    });

  }

  get totalPendientes(): number {
    return this.resumen?.cuotasPendientes ?? 0;
  }

  get ingresosMes(): string {

    if (!this.resumen) {
      return '—';
    }

    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(this.resumen.ingresosMes);

  }

  get paginaVisible(): number {
    return this.totalPaginas > 0 ? this.paginaActual + 1 : 0;
  }

  ngOnInit(): void {
    this.cargarCuotas();
  }

  cargarCuotas(): void {

    this.cargando = true;
    this.error = '';

    forkJoin({
      pagina: this.adminService.listarCuotas(
        this.paginaActual,
        this.tamanioPagina
      ),
      resumen: this.adminService.obtenerResumen()
    }).subscribe({

      next: ({ pagina, resumen }) => {

        this.cuotas = pagina.content;

        this.totalElementos = pagina.totalElements;

        this.totalPaginas = pagina.totalPages;

        this.resumen = resumen;

        this.cargando = false;

        this.cdr.markForCheck();

      },

      error: error => {

        console.error('Error al cargar las cuotas:', error);

        this.error =
          'No se pudieron cargar las cuotas. Comprueba la conexión con el servidor.';

        this.cargando = false;

        this.cdr.markForCheck();

      }

    });

  }

  cambiarFiltro(filtro: FiltroCuota): void {

    this.filtroEstado = filtro;

    this.cdr.markForCheck();

  }

  paginaAnterior(): void {

    if (this.paginaActual > 0) {

      this.paginaActual--;

      this.cargarCuotas();

    }

  }

  paginaSiguiente(): void {

    if (this.paginaActual + 1 < this.totalPaginas) {

      this.paginaActual++;

      this.cargarCuotas();

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

    return meses[mes - 1] || 'Mes desconocido';

  }

  formatearImporte(importe: number): string {

    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(importe);

  }

  formatearFechaPago(fecha: string | null): string {

    if (!fecha) {
      return 'Sin pagar';
    }

    const fechaLocal = new Date(fecha);

    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(fechaLocal);

  }
  volverDashboard(): void {

    this.router.navigate(['/admin/dashboard']);

  }

  cerrarSesion(): void {

    sessionStorage.clear();

    this.router.navigate(['/login']);

  }

}
