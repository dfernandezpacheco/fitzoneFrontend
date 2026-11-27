import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SocioService, ReservaSocio } from '../../../services/socio';

@Component({
  selector: 'app-reservas-socio',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css',
})
export class ReservasSocioComponent implements OnInit {
  reservas = signal<ReservaSocio[]>([]);
  cargando = signal(true);
  error = signal('');
  filtro = signal<'todas' | 'activas' | 'canceladas'>('activas');
  usuario = sessionStorage.getItem('usuario') || 'Socio';

  constructor(
    private service: SocioService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.service.listarMisReservas().subscribe({
      next: (r) => {
        this.reservas.set(r);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        if (e.status === 401) {
          this.cerrarSesion();
          return;
        }
        this.error.set(e.error?.message || 'No se pudieron cargar tus reservas.');
      },
    });
  }

  get visibles(): ReservaSocio[] {
    return this.reservas().filter(
      (r) =>
        this.filtro() === 'todas' ||
        (this.filtro() === 'activas' ? r.estado : !r.estado),
    );
  }

  fecha(f: string): string {
    const d = new Date(f);
    return Number.isNaN(d.getTime())
      ? 'Fecha no disponible'
      : new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(d);
  }

  cerrarSesion(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
