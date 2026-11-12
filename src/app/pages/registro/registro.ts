import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AuthService, PlanRegistro } from '../../services/auth';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: '../login/login.css'
})
export class RegistroComponent implements OnInit {
  dni = '';
  nombreCompleto = '';
  correo = '';
  telefono = '';
  matricula = '';
  contrasena = '';
  confirmarContrasena = '';
  planId: number | null = null;
  planes: PlanRegistro[] = [];
  error = '';
  cargando = false;
  cargandoPlanes = true;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.auth.obtenerPlanes().subscribe({
      next: planes => { this.planes = planes; this.cargandoPlanes = false; },
      error: () => { this.error = 'No se pudieron cargar los planes.'; this.cargandoPlanes = false; }
    });
  }

  registrar(): void {
    this.error = '';
    if (this.matricula.trim() && !/^[0-9]{4}[B-DF-HJ-NP-TV-Z]{3}$/i.test(this.matricula.trim())) {
      this.error = 'La matrícula debe tener 4 números y 3 consonantes, sin vocales. Ejemplo: 1234DBV.';
      return;
    }
    if (this.contrasena !== this.confirmarContrasena) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }
    if (this.planId === null) {
      this.error = 'Selecciona un plan.';
      return;
    }
    this.cargando = true;
    this.auth.registrar({
      dni: this.dni.trim().toUpperCase(),
      nombreCompleto: this.nombreCompleto.trim(),
      correo: this.correo.trim().toLowerCase(),
      telefono: this.telefono.trim(),
      matricula: this.matricula.trim().toUpperCase(),
      contrasena: this.contrasena,
      confirmarContrasena: this.confirmarContrasena,
      planId: this.planId
    }).pipe(finalize(() => this.cargando = false)).subscribe({
      next: sesion => {
        sessionStorage.setItem('token', sesion.token);
        sessionStorage.setItem('usuario', sesion.usuario);
        sessionStorage.setItem('id', sesion.id.toString());
        sessionStorage.setItem('rol', sesion.rol.toString());
        this.router.navigate(['/socio/dashboard']);
      },
      error: (e: HttpErrorResponse) => {
        this.error = e.error?.detail || e.error?.message ||
          (e.status === 0 ? 'No se puede conectar con el servidor.' : 'No se pudo crear la cuenta. Revisa los datos.');
      }
    });
  }
}
