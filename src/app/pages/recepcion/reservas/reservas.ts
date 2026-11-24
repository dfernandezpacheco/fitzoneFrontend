import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Reserva {
  id: number;
  hora: string;
  socio: string;
  clase: string;
  entrenador: string;
  estado: 'Confirmada' | 'Pendiente';
}

@Component({
  selector: 'app-reservas-recepcion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css'
})
export class ReservasComponent {

  busqueda = signal('');
  periodo = signal<'hoy' | 'semana'>('hoy');

  reservas = signal<Reserva[]>([
    {
      id: 1,
      hora: '17:30',
      socio: 'María López',
      clase: 'HIIT',
      entrenador: 'Laura Martín',
      estado: 'Confirmada'
    },
    {
      id: 2,
      hora: '18:30',
      socio: 'David García',
      clase: 'HIIT',
      entrenador: 'Laura Martín',
      estado: 'Confirmada'
    },
    {
      id: 3,
      hora: '19:30',
      socio: 'Lucía Torres',
      clase: 'Fuerza',
      entrenador: 'Carlos Pérez',
      estado: 'Confirmada'
    },
    {
      id: 4,
      hora: '20:30',
      socio: 'Pablo Martín',
      clase: 'Yoga',
      entrenador: 'Ana Ruiz',
      estado: 'Pendiente'
    },
    {
      id: 5,
      hora: '21:00',
      socio: 'Sara Díaz',
      clase: 'Ciclo',
      entrenador: 'Marta León',
      estado: 'Confirmada'
    }
  ]);

  reservasFiltradas = computed(() => {
    const texto = this.busqueda().toLowerCase().trim();

    return this.reservas().filter(reserva =>
      reserva.socio.toLowerCase().includes(texto) ||
      reserva.clase.toLowerCase().includes(texto) ||
      reserva.entrenador.toLowerCase().includes(texto) ||
      reserva.hora.includes(texto)
    );
  });

  cambiarPeriodo(periodo: 'hoy' | 'semana'): void {
    this.periodo.set(periodo);
  }
}
