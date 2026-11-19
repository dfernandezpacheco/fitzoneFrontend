import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { forkJoin } from 'rxjs';

import {
  RecepcionService,
  TurnoRecepcion,
  MonitorRecepcion,
  CrearTurnoRecepcion
} from '../../../services/recepcion';

@Component({
  selector: 'app-recepcion-turnos',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './turnos.html',
  styleUrl: './turnos.css'
})
export class RecepcionTurnosComponent implements OnInit {

  private recepcionService = inject(RecepcionService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  usuario = sessionStorage.getItem('usuario') || 'Recepción';

  turnos: TurnoRecepcion[] = [];
  monitores: MonitorRecepcion[] = [];

  fechaSeleccionada = this.obtenerFechaActual();

  cargando = true;
  guardando = false;

  error = '';
  mensaje = '';

  mostrarFormulario = false;

  formulario: CrearTurnoRecepcion = this.formularioVacio();

  get inicialUsuario(): string {
    return this.usuario.charAt(0).toUpperCase();
  }

  get totalTurnos(): number {
    return this.turnos.length;
  }

  get totalReservas(): number {
    return this.turnos.reduce(
      (total, turno) => total + turno.reservasConfirmadas,
      0
    );
  }

  get totalAforo(): number {
    return this.turnos.reduce(
      (total, turno) => total + turno.aforoMaximo,
      0
    );
  }

  get plazasDisponibles(): number {
    return Math.max(0, this.totalAforo - this.totalReservas);
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  private obtenerFechaActual(): string {

    const ahora = new Date();

    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;

  }

  private formularioVacio(): CrearTurnoRecepcion {

    return {
      nombre: '',
      fecha: this.fechaSeleccionada,
      hora: '18:00',
      duracion: '01:00',
      sala: '',
      aforoMaximo: 20,
      monitorId: 0
    };

  }

  cargarDatos(): void {

    this.cargando = true;
    this.error = '';

    forkJoin({

      turnos: this.recepcionService.listarTurnos(
        this.fechaSeleccionada
      ),

      monitores: this.recepcionService.listarMonitores()

    }).subscribe({

      next: ({ turnos, monitores }) => {

        this.turnos = turnos;
        this.monitores = monitores;

        this.cargando = false;

        this.cdr.markForCheck();

      },

      error: error => {

        console.error('Error al cargar los turnos:', error);

        this.error = 'No se pudieron cargar los turnos.';

        this.cargando = false;

        this.cdr.markForCheck();

      }

    });

  }

  cambiarFecha(event: Event): void {

    const valor = (event.target as HTMLInputElement).value;

    if (!valor) {
      return;
    }

    this.fechaSeleccionada = valor;

    this.cargarDatos();

  }

  abrirFormulario(): void {

    this.formulario = this.formularioVacio();

    this.formulario.fecha = this.fechaSeleccionada;

    this.error = '';
    this.mostrarFormulario = true;

    this.cdr.markForCheck();

  }

  cerrarFormulario(): void {

    if (this.guardando) {
      return;
    }

    this.mostrarFormulario = false;

    this.cdr.markForCheck();

  }

  guardarTurno(): void {

    if (!this.formulario.nombre.trim()) {
      this.error = 'El nombre de la actividad es obligatorio.';
      return;
    }

    if (!this.formulario.fecha || !this.formulario.hora) {
      this.error = 'Debes seleccionar fecha y hora.';
      return;
    }

    if (!this.formulario.duracion) {
      this.error = 'Debes indicar la duración.';
      return;
    }

    if (!this.formulario.sala.trim()) {
      this.error = 'Debes indicar la sala.';
      return;
    }

    if (
      this.formulario.aforoMaximo < 1 ||
      this.formulario.aforoMaximo > 100
    ) {
      this.error = 'El aforo debe estar entre 1 y 100.';
      return;
    }

    if (this.formulario.monitorId <= 0) {
      this.error = 'Debes seleccionar un monitor.';
      return;
    }

    const datos: CrearTurnoRecepcion = {
      ...this.formulario,
      nombre: this.formulario.nombre.trim(),
      sala: this.formulario.sala.trim()
    };

    this.guardando = true;
    this.error = '';
    this.mensaje = '';

    this.recepcionService.crearTurno(datos).subscribe({

      next: turno => {

        this.guardando = false;
        this.mostrarFormulario = false;

        this.fechaSeleccionada = datos.fecha;

        this.mensaje =
          `El turno ${turno.nombre} se ha creado correctamente.`;

        this.cargarDatos();

        this.cdr.markForCheck();

      },

      error: error => {

        console.error('Error al crear turno:', error);

        this.guardando = false;

        this.error =
          error.error?.message ||
          error.error?.detail ||
          'No se pudo crear el turno. Comprueba los datos.';

        this.cdr.markForCheck();

      }

    });

  }

  formatearHora(hora: string): string {
    return hora ? hora.substring(0, 5) : '—';
  }

  formatearDuracion(duracion: string): string {

    if (!duracion) {
      return '—';
    }

    const partes = duracion.split(':');

    return `${partes[0]} h ${partes[1]} min`;

  }

  obtenerPorcentajeOcupacion(turno: TurnoRecepcion): number {

    if (turno.aforoMaximo <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        turno.reservasConfirmadas / turno.aforoMaximo * 100
      )
    );

  }

  volverDashboard(): void {
    this.router.navigate(['/recepcion/dashboard']);
  }

  cerrarSesion(): void {

    sessionStorage.clear();

    this.router.navigate(['/login']);

  }

}
