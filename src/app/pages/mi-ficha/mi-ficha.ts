import { Component, OnInit, computed, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { MiPerfilSocio, SocioService } from '../../services/socio';

@Component({
  selector: 'app-mi-ficha',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './mi-ficha.html',
  styleUrl: './mi-ficha.css'
})
export class MiFichaComponent implements OnInit {
  perfil = signal<MiPerfilSocio | null>(null);
  cargando = signal(true);
  error = signal('');

  nombreCompleto = computed(() => {
    const socio = this.perfil();
    return socio ? `${socio.nombre} ${socio.apellidos}` : 'Socio';
  });

  inicial = computed(() => this.nombreCompleto().charAt(0).toUpperCase());
  plan = computed(() => this.perfil()?.planNombre ?? 'Sin plan asignado');
  estado = computed(() => this.perfil()?.activo ? 'ACTIVO' : 'INACTIVO');
  fechaAlta = computed(() => {
    const fecha = this.perfil()?.fechaAlta;
    return fecha ? new Intl.DateTimeFormat('es-ES').format(new Date(`${fecha}T00:00:00`)) : '—';
  });

  constructor(private socioService: SocioService, private router: Router) {}

  ngOnInit(): void {
    this.cargarFicha();
  }

  cargarFicha(): void {
    this.cargando.set(true);
    this.error.set('');
    this.socioService.obtenerMiPerfil().subscribe({
      next: perfil => {
        this.perfil.set(perfil);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.cargando.set(false);
        if (error.status === 401) {
          this.cerrarSesion();
          return;
        }
        this.error.set('No se ha podido cargar tu ficha.');
      }
    });
  }

  cerrarSesion(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
