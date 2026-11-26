import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import {
  RecepcionService,
  ReservaListadoRecepcion
} from '../../../services/recepcion';

type Periodo = 'hoy' | 'semana';
type FiltroEstado = 'todas' | 'confirmadas' | 'canceladas';

@Component({
  selector: 'app-reservas-recepcion',
  standalone: true,
  imports: [],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css'
})
export class ReservasComponent implements OnInit {

  private recepcionService = inject(RecepcionService);
  private router = inject(Router);

  usuario = sessionStorage.getItem('usuario') || 'Recepción';

  busqueda = signal('');
  periodo = signal<Periodo>('hoy');
  filtroEstado = signal<FiltroEstado>('todas');

  reservas = signal<ReservaListadoRecepcion[]>([]);
  cargando = signal(true);
  error = signal('');
  mensaje = signal('');

  totalConfirmadas = computed(() => this.reservas().filter(r => r.estado).length);
  totalCanceladas = computed(() => this.reservas().filter(r => !r.estado).length);

  reservasFiltradas = computed(() => {
    const texto = this.busqueda().toLowerCase().trim();
    const estado = this.filtroEstado();

    return this.reservas().filter(r => {
      const coincideTexto =
        !texto ||
        r.nombreSocio.toLowerCase().includes(texto) ||
        r.dniSocio.toLowerCase().includes(texto) ||
        r.nombreActividad.toLowerCase().includes(texto) ||
        (r.nombreMonitor || '').toLowerCase().includes(texto);

      const coincideEstado =
        estado === 'todas' ||
        (estado === 'confirmadas' && r.estado) ||
        (estado === 'canceladas' && !r.estado);

      return coincideTexto && coincideEstado;
    });
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');

    const hoy = new Date();
    const fin = new Date(hoy);
    if (this.periodo() === 'semana') {
      fin.setDate(fin.getDate() + 6);
    }

    this.recepcionService
      .listarReservas(this.aIso(hoy), this.aIso(fin))
      .subscribe({
        next: reservas => {
          this.reservas.set(reservas);
          this.cargando.set(false);
        },
        error: err => {
          this.error.set(err.error?.detail || 'No se pudieron cargar las reservas.');
          this.cargando.set(false);
        }
      });
  }

  cambiarPeriodo(periodo: Periodo): void {
    this.periodo.set(periodo);
    this.cargar();
  }

  marcarAsistencia(reserva: ReservaListadoRecepcion, asistio: boolean): void {
    this.mensaje.set('');
    this.error.set('');

    this.recepcionService
      .actualizarAsistencia(reserva.actividadId, reserva.reservaId, asistio)
      .subscribe({
        next: () => {
          this.reservas.update(lista =>
            lista.map(r => r.reservaId === reserva.reservaId ? { ...r, asistio } : r)
          );
        },
        error: err => {
          this.error.set(err.error?.detail || 'No se pudo registrar la asistencia.');
        }
      });
  }

  cancelar(reserva: ReservaListadoRecepcion): void {
    if (!confirm(`¿Cancelar la reserva de ${reserva.nombreSocio} en ${reserva.nombreActividad}?`)) {
      return;
    }

    this.mensaje.set('');
    this.error.set('');

    this.recepcionService
      .cancelarReserva(reserva.actividadId, reserva.reservaId)
      .subscribe({
        next: () => {
          this.reservas.update(lista =>
            lista.map(r => r.reservaId === reserva.reservaId ? { ...r, estado: false } : r)
          );
          this.mensaje.set('Reserva cancelada correctamente.');
        },
        error: err => {
          this.error.set(err.error?.detail || 'No se pudo cancelar la reserva.');
        }
      });
  }

  hora(reserva: ReservaListadoRecepcion): string {
    return reserva.hora ? reserva.hora.substring(0, 5) : '—';
  }

  estadoTexto(r: ReservaListadoRecepcion): string {
    if (!r.estado) return 'Cancelada';
    if (r.asistio === true) return 'Asistió';
    if (r.asistio === false) return 'No asistió';
    return 'Confirmada';
  }

  estadoClase(r: ReservaListadoRecepcion): string {
    if (!r.estado) return 'cancelled';
    if (r.asistio === true) return 'attended';
    if (r.asistio === false) return 'absent';
    return 'confirmed';
  }

  cerrarSesion(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  private aIso(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
}
