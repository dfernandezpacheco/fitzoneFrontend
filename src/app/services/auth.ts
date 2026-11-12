import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SesionIniciada {
  id: number;
  usuario: string;
  rol: number;
  token: string;
}

export interface PlanRegistro {
  id: number;
  nombre: string;
  precioMensual: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiBase = 'http://localhost:8081';

  constructor(private http: HttpClient) {}

  login(credenciales: {
    usuario: string;
    clave: string;
  }): Observable<SesionIniciada> {

    return this.http.post<SesionIniciada>(
      `${this.apiBase}/api/v1/auth/login`,
      credenciales
    );
  }

  registrar(datos: {
    dni: string;
    nombreCompleto: string;
    correo: string;
    telefono: string;
    matricula: string;
    contrasena: string;
    confirmarContrasena: string;
    planId: number;
  }): Observable<SesionIniciada> {
    return this.http.post<SesionIniciada>(`${this.apiBase}/api/v1/auth/registro`, datos);
  }

  obtenerPlanes(): Observable<PlanRegistro[]> {
    return this.http.get<PlanRegistro[]>(`${this.apiBase}/api/v1/planes`);
  }
}
