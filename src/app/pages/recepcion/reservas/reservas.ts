import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ReservaRecepcion {
  reservaId: number;
  socioId: number;
  nombreSocio: string;
  apellidoSocio: string;
  actividad: string;
  fechaReserva: string;
  fechaActividad: string;
  hora: string;
  estado: boolean;
  asistio: boolean | null;
}

@Component({
  selector: 'app-reservas-recepcion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css'
})
export class ReservasComponent {

  reservas = signal<ReservaRecepcion[]>([
    {
      reservaId: 1,
      socioId: 101,
      nombreSocio: 'Carlos',
      apellidoSocio: 'García',
      actividad: 'Spinning',
      fechaReserva: '2026-11-20',
      fechaActividad: '2026-11-25',
      hora: '10:00',
      estado: true,
      asistio: null
    },
    {
      reservaId: 2,
      socioId: 102,
      nombreSocio: 'Laura',
      apellidoSocio: 'Martínez',
      actividad: 'Yoga',
      fechaReserva: '2026-11-21',
      fechaActividad: '2026-11-25',
      hora: '11:30',
      estado: true,
      asistio: true
    },
    {
      reservaId: 3,
      socioId: 103,
      nombreSocio: 'David',
      apellidoSocio: 'López',
      actividad: 'Cross Training',
      fechaReserva: '2026-11-19',
      fechaActividad: '2026-11-26',
      hora: '18:00',
      estado: false,
      asistio: null
    }
  ]);

  busqueda = signal('');
  filtroEstado = signal('todas');

  reservasFiltradas = computed(() => {
    const texto = this.busqueda().toLowerCase().trim();
    const estado = this.filtroEstado();

    return this.reservas().filter(reserva => {

      const nombre = `${reserva.nombreSocio} ${reserva.apellidoSocio}`.toLowerCase();

      const coincideBusqueda =
        nombre.includes(texto) ||
        reserva.actividad.toLowerCase().includes(texto);

      const coincideEstado =
        estado === 'todas' ||
        (estado === 'activas' && reserva.estado) ||
        (estado === 'canceladas' && !reserva.estado);

      return coincideBusqueda && coincideEstado;
    });
  });

  totalReservas = computed(() => this.reservas().length);

  reservasActivas = computed(() =>
    this.reservas().filter(reserva => reserva.estado).length
  );

  reservasCanceladas = computed(() =>
    this.reservas().filter(reserva => !reserva.estado).length
  );
}
