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
  SocioRecepcion,
  PlanRecepcion,
  CrearSocioRecepcion
} from '../../../services/recepcion';

type FiltroSocio = 'TODOS' | 'ACTIVOS' | 'SUSPENDIDOS';

@Component({
  selector: 'app-recepcion-socios',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './socios.html',
  styleUrl: './socios.css'
})
export class RecepcionSociosComponent implements OnInit {

  private recepcionService = inject(RecepcionService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  usuario = sessionStorage.getItem('usuario') || 'Recepción';

  socios: SocioRecepcion[] = [];
  planes: PlanRecepcion[] = [];

  cargando = true;
  guardando = false;

  error = '';
  mensaje = '';

  terminoBusqueda = '';
  filtroEstado: FiltroSocio = 'TODOS';

  paginaActual = 0;
  tamanioPagina = 20;

  totalSocios = 0;
  totalPaginas = 0;

  mostrarFormulario = false;

  formulario: CrearSocioRecepcion = {
    dni: '',
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    matricula: '',
    planId: 0
  };

  get inicialUsuario(): string {
    return this.usuario.charAt(0).toUpperCase();
  }

  get sociosActivos(): number {
    return this.socios.filter(s => s.activo).length;
  }

  get sociosSuspendidos(): number {
    return this.socios.filter(s => !s.activo).length;
  }

  get sociosFiltrados(): SocioRecepcion[] {

    const busqueda = this.terminoBusqueda
      .trim()
      .toLowerCase();

    return this.socios.filter(socio => {

      const nombre =
        `${socio.nombre} ${socio.apellidos}`.toLowerCase();

      const coincideBusqueda =
        !busqueda ||
        nombre.includes(busqueda) ||
        (socio.dni || '').toLowerCase().includes(busqueda) ||
        (socio.email || '').toLowerCase().includes(busqueda);

      const coincideEstado =
        this.filtroEstado === 'TODOS' ||
        (this.filtroEstado === 'ACTIVOS' && socio.activo) ||
        (this.filtroEstado === 'SUSPENDIDOS' && !socio.activo);

      return coincideBusqueda && coincideEstado;

    });

  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {

    this.cargando = true;
    this.error = '';

    forkJoin({
      pagina: this.recepcionService.listarSocios(
        this.paginaActual,
        this.tamanioPagina
      ),
      planes: this.recepcionService.listarPlanes()
    }).subscribe({

      next: ({ pagina, planes }) => {

        this.socios = pagina.content;
        this.planes = planes;

        this.totalSocios = pagina.totalElements;
        this.totalPaginas = pagina.totalPages;
        this.paginaActual = pagina.number;

        this.cargando = false;

        this.cdr.markForCheck();

      },

      error: error => {

        console.error('Error al cargar socios:', error);

        this.error = 'No se pudo cargar la información de los socios.';

        this.cargando = false;

        this.cdr.markForCheck();

      }

    });

  }

  cambiarFiltro(filtro: FiltroSocio): void {

    this.filtroEstado = filtro;

    this.cdr.markForCheck();

  }

  paginaAnterior(): void {

    if (this.paginaActual > 0) {

      this.paginaActual--;

      this.cargarDatos();

    }

  }

  paginaSiguiente(): void {

    if (this.paginaActual + 1 < this.totalPaginas) {

      this.paginaActual++;

      this.cargarDatos();

    }

  }

  get paginaVisible(): number {
    return this.totalPaginas > 0 ? this.paginaActual + 1 : 0;
  }

  abrirFormulario(): void {

    this.formulario = {
      dni: '',
      nombre: '',
      apellidos: '',
      email: '',
      telefono: '',
      matricula: '',
      planId: 0
    };

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

  guardarSocio(): void {

    if (!this.formulario.dni.trim()) {
      this.error = 'El DNI es obligatorio.';
      return;
    }

    if (!this.formulario.nombre.trim()) {
      this.error = 'El nombre es obligatorio.';
      return;
    }

    if (!this.formulario.apellidos.trim()) {
      this.error = 'Los apellidos son obligatorios.';
      return;
    }

    if (!this.formulario.email.trim()) {
      this.error = 'El email es obligatorio.';
      return;
    }

    if (this.formulario.planId <= 0) {
      this.error = 'Debes seleccionar un plan.';
      return;
    }

    const datos: CrearSocioRecepcion = {
      ...this.formulario,
      dni: this.formulario.dni.trim().toUpperCase(),
      nombre: this.formulario.nombre.trim(),
      apellidos: this.formulario.apellidos.trim(),
      email: this.formulario.email.trim(),
      telefono: this.formulario.telefono.trim(),
      matricula: this.formulario.matricula.trim().toUpperCase()
    };

    this.guardando = true;
    this.error = '';

    this.recepcionService.crearSocio(datos).subscribe({

      next: socio => {

        this.guardando = false;
        this.mostrarFormulario = false;

        this.mensaje =
          `Socio ${socio.nombre} ${socio.apellidos} registrado correctamente.`;

        this.paginaActual = 0;

        this.cdr.markForCheck();

        this.cargarDatos();

      },

      error: error => {

        console.error('Error al registrar socio:', error);

        this.guardando = false;

        this.error =
          error.error?.message ||
          'No se pudo registrar el socio. Comprueba los datos.';

        this.cdr.markForCheck();

      }

    });

  }

  formatearPrecio(precio: number): string {

    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(precio);

  }

  formatearFecha(fecha: string): string {

    if (!fecha) {
      return '—';
    }

    return new Intl.DateTimeFormat('es-ES').format(
      new Date(`${fecha}T00:00:00`)
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
