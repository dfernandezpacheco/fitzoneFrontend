import { Component, OnInit, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import {
  SocioService,
  MiPerfilSocio,
  ResumenSocio
} from '../../services/socio';


@Component({
  selector: 'app-socio-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class SocioDashboardComponent implements OnInit {

  perfil = signal<MiPerfilSocio | null>(null);
  resumen = signal<ResumenSocio | null>(null);

  usuario = signal(
    sessionStorage.getItem('usuario') || 'Socio'
  );
  cargandoPerfil = signal(true);

  errorPerfil = signal('');

  nombreCompleto = computed(() => {

    const datos = this.perfil();

    if (!datos) {
      return this.usuario();
    }

    return `${datos.nombre} ${datos.apellidos}`;

  });
  inicialUsuario = computed(() => {

    return this.nombreCompleto().charAt(0).toUpperCase();

  });

  planActual = computed(() => {

    const datos = this.perfil();

    if (!datos) {
      return this.cargandoPerfil() ? 'Cargando...' : 'Sin plan';
    }

    return datos.planNombre || 'Sin plan';

  });
  estadoSocio = computed(() => {
    const datos = this.perfil();
    if (!datos) {
      return this.cargandoPerfil() ? 'Comprobando...' : 'No disponible';
    }
    return datos.activo ? 'SOCIO ACTIVO' : 'SOCIO INACTIVO';
  });
  socioInactivo = computed(() => {
    return this.perfil()?.activo === false;

  });

  constructor(
    private socioService: SocioService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.cargarPerfil();

  }

  cargarPerfil(): void {
    this.cargandoPerfil.set(true);
    this.errorPerfil.set('');
    this.socioService.obtenerMiPerfil().subscribe({
      next: (respuesta: MiPerfilSocio) => {
        this.perfil.set(respuesta);
        this.usuario.set(respuesta.usuario);
        this.cargandoPerfil.set(false);
        this.cargarResumen();

      },

      error: (error: HttpErrorResponse) => {
        this.cargandoPerfil.set(false);
        if (error.status === 401) {
          this.cerrarSesion();
        } else {
          this.errorPerfil.set(
            'No se ha podido cargar tu información.'
          );
        }
      }
    });
  }

  cargarResumen(): void {
    this.socioService.obtenerMiResumen().subscribe({
      next: resumen => this.resumen.set(resumen),
      error: (error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.cerrarSesion();
          return;
        }
        this.errorPerfil.set('No se ha podido cargar el resumen de actividad.');
      }
    });
  }

  formatoFecha(fecha: string): string {

    const fechaActividad = new Date(fecha);

    if (Number.isNaN(fechaActividad.getTime())) {
      return 'Fecha no disponible';
    }

    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short'
    }).format(fechaActividad).toUpperCase();

  }

  diaActividad(fecha: string): string {

    const fechaActividad = new Date(fecha);

    if (Number.isNaN(fechaActividad.getTime())) {
      return 'FECHA PENDIENTE';
    }

    const hoy = new Date();

    const manana = new Date();

    manana.setDate(hoy.getDate() + 1);

    const mismaFecha = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (mismaFecha(fechaActividad, hoy)) {
      return 'HOY';
    }

    if (mismaFecha(fechaActividad, manana)) {
      return 'MAÑANA';
    }

    return this.formatoFecha(fecha);

  }

  cerrarSesion(): void {

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('id');
    sessionStorage.removeItem('rol');

    this.router.navigate(['/login']);

  }

}
