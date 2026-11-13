import { Component } from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, RouterLinkActive],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  usuario: string = '';
  clave: string = '';

  mensajeError: string = '';
  cargando: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  onLogin(): void {
    this.mensajeError = '';
    if (!this.usuario.trim() || !this.clave) {
      this.mensajeError =
        'Por favor, introduce tu usuario y contraseña.';
      return;
    }
    this.cargando = true;
    this.authService.login({
      usuario: this.usuario.trim(),
      clave: this.clave
    }).subscribe({
      next: (respuesta) => {
        sessionStorage.setItem('token', respuesta.token);
        sessionStorage.setItem('usuario', respuesta.usuario);
        sessionStorage.setItem('id', respuesta.id.toString());
        sessionStorage.setItem('rol', respuesta.rol.toString());
        this.cargando = false;
        switch (respuesta.rol) {
          case 1:
            this.router.navigateByUrl('/admin/dashboard');
            break;
          case 2:
            this.router.navigateByUrl('/recepcion/dashboard');
            break;
          case 3:
            this.router.navigateByUrl('/socio/dashboard');
            break;
          default:
            sessionStorage.clear();
            this.mensajeError =
              'Tu cuenta no tiene un rol válido.';
            break;
        }
        },
      error: (error: HttpErrorResponse) => {
        this.cargando = false;
        if (error.status === 401) {
          this.mensajeError =
            'Nombre de usuario o contraseña incorrectos.';
        } else if (error.status === 0) {
          this.mensajeError =
            'No se puede conectar con el servidor. Comprueba que Spring Boot está iniciado.';
        } else {
          this.mensajeError =
            error.error?.detail ||
            'Ha ocurrido un error al iniciar sesión.';
        }
      }
    });
  }
}
