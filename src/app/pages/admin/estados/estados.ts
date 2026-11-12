import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { Router } from '@angular/router';

import {
  AdminService,
  SocioAdmin
} from '../../../services/admin';

type FiltroEstado = 'TODOS' | 'ACTIVOS' | 'SUSPENDIDOS';

@Component({
  selector: 'app-admin-estados',
  standalone: true,
  imports: [],
  templateUrl: './estados.html',
  styleUrl: './estados.css'
})
export class AdminEstadosComponent implements OnInit {

  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  usuario = sessionStorage.getItem('usuario') || 'Administrador';

  socios: SocioAdmin[] = [];

  cargando = true;
  error = '';
  mensaje = '';

  terminoBusqueda = '';

  filtroEstado: FiltroEstado = 'TODOS';

  socioProcesandoId: number | null = null;

  get inicialUsuario(): string {
    return this.usuario.charAt(0).toUpperCase();
  }

  get totalSocios(): number {
    return this.socios.length;
  }

  get totalActivos(): number {
    return this.socios.filter(socio => socio.activo).length;
  }

  get totalSuspendidos(): number {
    return this.socios.filter(socio => !socio.activo).length;
  }

  get sociosFiltrados(): SocioAdmin[] {

    const busqueda = this.terminoBusqueda
      .trim()
      .toLowerCase();

    return this.socios.filter(socio => {

      const coincideBusqueda =
        !busqueda ||
        [
          socio.nombre,
          socio.apellidos,
          socio.dni,
          socio.email,
          socio.matricula
        ].some(valor =>
          (valor ?? '').toLowerCase().includes(busqueda)
        );

      const coincideEstado =
        this.filtroEstado === 'TODOS' ||
        (this.filtroEstado === 'ACTIVOS' && socio.activo) ||
        (this.filtroEstado === 'SUSPENDIDOS' && !socio.activo);

      return coincideBusqueda && coincideEstado;

    });

  }

  ngOnInit(): void {
    this.cargarSocios();
  }

  cargarSocios(): void {

    this.cargando = true;
    this.error = '';

    this.adminService.listarSocios(0, 100).subscribe({

      next: respuesta => {

        this.socios = respuesta.content;

        this.cargando = false;

        this.cdr.markForCheck();

      },

      error: error => {

        console.error('Error al cargar los socios:', error);

        this.error = 'No se pudo cargar el listado de socios.';

        this.cargando = false;

        this.cdr.markForCheck();

      }

    });

  }

  cambiarFiltro(filtro: FiltroEstado): void {

    this.filtroEstado = filtro;

    this.cdr.markForCheck();

  }

  cambiarEstado(socio: SocioAdmin): void {

    const nuevoEstado = !socio.activo;

    const accion = nuevoEstado
      ? 'reactivar'
      : 'suspender';

    const confirmado = window.confirm(
      `¿Estás seguro de que deseas ${accion} a ${socio.nombre} ${socio.apellidos}?`
    );

    if (!confirmado) {
      return;
    }

    this.socioProcesandoId = socio.id;
    this.mensaje = '';
    this.error = '';

    this.adminService.cambiarEstadoSocio(
      socio.id,
      nuevoEstado
    ).subscribe({

      next: socioActualizado => {

        this.socios = this.socios.map(actual =>
          actual.id === socioActualizado.id
            ? socioActualizado
            : actual
        );

        this.mensaje = nuevoEstado
          ? 'Socio reactivado correctamente.'
          : 'Socio suspendido correctamente.';

        this.socioProcesandoId = null;

        this.cdr.markForCheck();

      },

      error: error => {

        console.error('Error al cambiar el estado:', error);

        this.error =
          error.error?.message ||
          'No se pudo modificar el estado del socio.';

        this.socioProcesandoId = null;

        this.cdr.markForCheck();

      }

    });

  }

  formatearFecha(fecha: string): string {

    if (!fecha) {
      return '—';
    }

    const fechaLocal = new Date(`${fecha}T00:00:00`);

    return new Intl.DateTimeFormat('es-ES').format(fechaLocal);

  }

  volverDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  cerrarSesion(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

}
