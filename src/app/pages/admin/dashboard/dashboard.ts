import {Component, inject, ChangeDetectorRef} from '@angular/core';
import { Router } from '@angular/router';
import {AdminResumen, AdminService} from '../../../services/admin';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class AdminDashboardComponent {

  usuario = sessionStorage.getItem('usuario') || 'Administrador';

  get inicialUsuario(): string {

    return this.usuario.charAt(0).toUpperCase();


  }
  private adminService = inject(AdminService);

  resumen: AdminResumen | null = null;
  cargandoResumen = true;
  errorResumen = '';

  ngOnInit(): void {
    this.cargarResumen();
  }

  cargarResumen(): void {

    this.cargandoResumen = true;
    this.errorResumen = '';

    this.adminService.obtenerResumen().subscribe({

      next: (datos) => {

        this.resumen = datos;

        this.cargandoResumen = false;

        console.log('Resumen de administración:', datos);

        // Notificar a Angular que debe actualizar la pantalla
        this.cdr.markForCheck();

      },

      error: (error) => {

        console.error('Error al cargar el resumen:', error);

        this.errorResumen =
          'No se pudieron cargar los datos del administrador.';

        this.cargandoResumen = false;

        this.cdr.markForCheck();

      }

    });

  }

  get ingresosMesFormateados(): string {
    if (this.resumen === null) {
      return '—';
    }

    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(this.resumen.ingresosMes);
  }

  private cdr = inject(ChangeDetectorRef);

  cerrarSesion(): void {

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('id');
    sessionStorage.removeItem('rol');

    this.router.navigate(['/login']);

  }

  constructor(private router: Router) {}

}
