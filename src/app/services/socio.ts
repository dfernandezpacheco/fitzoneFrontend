import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MiPerfilSocio {
  id: number;
  nombre: string;
  apellidos: string;
  usuario: string;
  email: string | null;
  telefono: string | null;
  fechaAlta: string | null;
  activo: boolean;
  planId: number | null;
  planNombre: string | null;
  precioMensual: number | null
}

export interface ActividadResumen {
  nombre: string;
  fecha: string;
  hora: string | null;
  sala: string | null;
  monitor: string | null;
}

export interface ResumenSocio {
  clasesEsteMes: number;
  reservasFuturas: number;
  estadoCuota: string;
  proximaActividad: ActividadResumen | null;
  actividadesRecientes: ActividadResumen[];
}
@Injectable({
  providedIn: 'root'
})
export class SocioService {
  private apiUrl = 'http://localhost:8081/socios';
  constructor(private http: HttpClient) {}

  obtenerMiPerfil(): Observable<MiPerfilSocio> {
    return this.http.get<MiPerfilSocio>(
      `${this.apiUrl}/mi-perfil`
    );
  }

  obtenerMiResumen(): Observable<ResumenSocio> {
    return this.http.get<ResumenSocio>(`${this.apiUrl}/mi-resumen`);
  }
}
