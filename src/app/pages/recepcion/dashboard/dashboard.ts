import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { Router } from '@angular/router';

import {
  RecepcionService,
  RecepcionResumen
} from '../../../services/recepcion';

@Component({
  selector: 'app-reception-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class ReceptionDashboardComponent implements OnInit {

  private recepcionService = inject(RecepcionService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  usuario = sessionStorage.getItem('usuario') || 'Recepción';

  resumen: RecepcionResumen | null = null;

  cargando = true;
  error = '';

  busqueda = '';

  get inicialUsuario(): string {
    return this.usuario.charAt(0).toUpperCase();
  }

  get sociosFiltrados() {

    if (!this.resumen) {
      return [];
    }

    const texto = this.busqueda.trim().toLowerCase();

    return this.resumen.sociosRecientes.filter(socio => {

      const nombre =
        `${socio.nombre} ${socio.apellidos}`.toLowerCase();

      return !texto ||
        nombre.includes(texto) ||
        (socio.dni || '').toLowerCase().includes(texto) ||
        (socio.email || '').toLowerCase().includes(texto);

    });

  }

  ngOnInit(): void {
    this.cargarResumen();
  }

  cargarResumen(): void {

    this.cargando = true;
    this.error = '';

    this.recepcionService.obtenerResumen().subscribe({

      next: datos => {

        this.resumen = datos;
        this.cargando = false;

        console.log('Resumen de recepción:', datos);

        this.cdr.markForCheck();

      },

      error: error => {

        console.error('Error al cargar recepción:', error);

        this.error = 'No se pudo cargar el panel de recepción.';

        this.cargando = false;

        this.cdr.markForCheck();

      }

    });

  }

  formatearFecha(fecha: string): string {

    if (!fecha) {
      return '—';
    }

    return new Intl.DateTimeFormat('es-ES').format(
      new Date(`${fecha}T00:00:00`)
    );

  }

  verSocios(): void {
    this.router.navigate(['/recepcion/socios']);
  }

  verPagos(): void {
    this.router.navigate(['/recepcion/pagos']);
  }

  verTurnos(): void {
    this.router.navigate(['/recepcion/turnos']);
  }

  cerrarSesion(): void {

    sessionStorage.clear();
    this.router.navigate(['/login']);

  }

}
