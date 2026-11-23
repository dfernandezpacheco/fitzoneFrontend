import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import {SocioService, ActividadDisponible, ReservaSocio} from '../../../services/socio';

@Component({
  selector: 'app-actividades-socio',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './actividades.html',
  styleUrl: './actividades.css'
})
export class ActividadesSocioComponent implements OnInit {

  actividades = signal<ActividadDisponible[]>([]);
  reservas = signal<ReservaSocio[]>([]);

  cargando = signal(true);
  error = signal('');
  mensaje = signal('');
  reservando = signal<number | null>(null);
  cancelando = signal<number | null>(null);

  constructor(
    private socioService: SocioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.error.set('');

    this.socioService.listarActividadesDisponibles().subscribe({
      next: actividades => {
        this.actividades.set(actividades);
        this.cargando.set(false);
      },
      error: error => {
        this.cargando.set(false);
        this.tratarError(error);
      }
    });

    this.cargarReservas();
  }

  cargarReservas(): void {
    this.socioService.listarMisReservas().subscribe({
      next: reservas => {
        this.reservas.set(
          reservas.filter(reserva => reserva.estado)
        );
      },
      error: error => this.tratarError(error)
    });
  }

  reservar(actividad: ActividadDisponible): void {

    this.mensaje.set('');
    this.error.set('');

    if (actividad.plazasDisponibles <= 0) {
      this.error.set('No quedan plazas disponibles.');
      return;
    }

    this.reservando.set(actividad.id);

    this.socioService.reservarActividad(actividad.id).subscribe({

      next: () => {

        this.reservando.set(null);

        this.mensaje.set(
          `¡Te has inscrito correctamente en ${actividad.nombre}!`
        );

        this.cargarDatos();

      },

      error: (error: HttpErrorResponse) => {

        this.reservando.set(null);

        if (error.status === 401) {
          this.cerrarSesion();
          return;
        }

        this.error.set(
          error.error?.message ||
          'No se ha podido realizar la reserva.'
        );

      }

    });
  }

  cancelar(reserva: ReservaSocio): void {

    this.error.set('');
    this.mensaje.set('');

    this.cancelando.set(reserva.id);

    this.socioService.cancelarReserva(reserva.id).subscribe({

      next: () => {
        this.cancelando.set(null);

        this.mensaje.set(
          `Has cancelado tu reserva de ${reserva.actividadNombre}.`
        );

        this.cargarDatos();
      },

      error: (error: HttpErrorResponse) => {
        this.cancelando.set(null);

        if (error.status === 401) {
          this.cerrarSesion();
          return;
        }

        this.error.set(
          error.error?.message ||
          'No se ha podido cancelar la reserva.'
        );
      }

    });
  }

  formatoFecha(fecha: string): string {

    const valor = new Date(fecha);

    if (Number.isNaN(valor.getTime())) {
      return 'Fecha no disponible';
    }

    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(valor);
  }

  cerrarSesion(): void {

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('id');
    sessionStorage.removeItem('rol');

    this.router.navigate(['/login']);
  }

  private tratarError(error: HttpErrorResponse): void {

    if (error.status === 401) {
      this.cerrarSesion();
      return;
    }

    this.error.set(
      error.error?.message ||
      'No se han podido cargar los datos.'
    );
  }
}
