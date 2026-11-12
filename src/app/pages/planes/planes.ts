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
  AdminService,
  PlanAdmin,
  GuardarPlan
} from '../../services/admin';

interface PlanAdminVista extends PlanAdmin {
  sociosInscritos: number;
}

@Component({
  selector: 'app-admin-planes',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './planes.html',
  styleUrl: './planes.css'
})
export class AdminPlanesComponent implements OnInit {

  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  usuario = sessionStorage.getItem('usuario') || 'Administrador';

  planes: PlanAdminVista[] = [];

  cargando = true;
  guardando = false;
  error = '';
  mensaje = '';

  mostrarFormulario = false;
  modoEdicion = false;
  planEditandoId: number | null = null;

  tiposPlan = [
    'BASICO',
    'ESTUDIANTE',
    'FAMILIAR',
    'PREMIUM',
    'VIP'
  ];

  formulario: GuardarPlan = {
    nombre: '',
    precioMensual: 0,
    tipo: 'BASICO'
  };

  get inicialUsuario(): string {
    return this.usuario.charAt(0).toUpperCase();
  }

  ngOnInit(): void {
    this.cargarPlanes();
  }

  cargarPlanes(): void {

    this.cargando = true;
    this.error = '';

    forkJoin({
      planes: this.adminService.listarPlanes(),
      resumen: this.adminService.obtenerResumen()
    }).subscribe({

      next: ({ planes, resumen }) => {

        this.planes = planes.map(plan => {

          const distribucion =
            resumen.distribucionSociosPorPlan.find(
              dato =>
                dato.nombrePlan.trim().toLowerCase() ===
                plan.nombre.trim().toLowerCase()
            );

          return {
            ...plan,
            sociosInscritos: distribucion?.totalSocios ?? 0
          };

        });
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: error => {
        console.error('Error al cargar los planes:', error);
        this.error = 'No se pudieron cargar los planes.';
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  abrirCrear(): void {

    this.modoEdicion = false;
    this.planEditandoId = null;

    this.formulario = {
      nombre: '',
      precioMensual: 0,
      tipo: 'BASICO'
    };
    this.mensaje = '';
    this.mostrarFormulario = true;
    this.cdr.markForCheck();
  }

  abrirEditar(plan: PlanAdminVista): void {

    this.modoEdicion = true;
    this.planEditandoId = plan.id;
    this.formulario = {
      nombre: plan.nombre,
      precioMensual: plan.precioMensual,
      tipo: plan.tipo
    };
    this.mensaje = '';
    this.mostrarFormulario = true;
    this.cdr.markForCheck();
  }

  cancelarFormulario(): void {

    this.mostrarFormulario = false;
    this.planEditandoId = null;
    this.mensaje = '';
    this.cdr.markForCheck();
  }

  guardarPlan(): void {

    const nombre = this.formulario.nombre.trim();
    const precio = Number(this.formulario.precioMensual);

    if (!nombre) {
      this.mensaje = 'El nombre del plan es obligatorio.';
      return;
    }

    if (!Number.isFinite(precio) || precio <= 0) {
      this.mensaje = 'El precio debe ser mayor que cero.';
      return;
    }

    const datos: GuardarPlan = {
      nombre,
      precioMensual: precio,
      tipo: this.formulario.tipo
    };

    this.guardando = true;
    this.mensaje = '';

    const peticion = this.modoEdicion && this.planEditandoId !== null
      ? this.adminService.actualizarPlan(this.planEditandoId, datos)
      : this.adminService.crearPlan(datos);

    peticion.subscribe({

      next: () => {

        this.guardando = false;
        this.mostrarFormulario = false;

        this.mensaje = this.modoEdicion
          ? 'Plan actualizado correctamente.'
          : 'Plan creado correctamente.';

        this.cargarPlanes();

        this.cdr.markForCheck();

      },
      error: error => {

        console.error('Error al guardar el plan:', error);

        this.guardando = false;

        this.mensaje =
          error.error?.message ||
          'No se pudo guardar el plan. Comprueba los datos.';

        this.cdr.markForCheck();

      }

    });

  }
  calcularTotalSocios(): number {

    return this.planes.reduce(
      (total, plan) => total + plan.sociosInscritos,
      0
    );

  }
  formatearPrecio(precio: number): string {

    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(precio);

  }
  volverDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }
  cerrarSesion(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

}
