import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OnInit, inject } from '@angular/core';
import { AdminService, AdminResumen } from '../../../services/admin';

@Component({
  selector: 'app-recepcion-dashboard',
  standalone: true,
  imports: [],
  template: `
    <div style="
      min-height: 100vh;
      background: #0a0d14;
      color: white;
      padding: 50px;
      font-family: Arial, sans-serif;
    ">

      <h1>FitZone · Recepción</h1>

      <p>Bienvenido al área de recepción.</p>

      <p>Estamos preparando tus herramientas de trabajo.</p>

      <button
        (click)="cerrarSesion()"
        style="
          padding: 12px 20px;
          background: #0052ff;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        "
      >
        Cerrar sesión
      </button>

    </div>
  `
})
export class ReceptionDashboardComponent {

  constructor(private router: Router) {}

  cerrarSesion(): void {

    sessionStorage.clear();

    this.router.navigate(['/login']);

  }

}
