import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PlanRecepcion {
  id: number;
  nombre: string;
  precioMensual: number;
}

export interface SocioRecepcion {
  id: number;
  dni: string;
  nombre: string;
  apellidos: string;
  email: string | null;
  telefono: string | null;
  matricula: string | null;
  activo: boolean;
  fechaAlta: string;
  plan: PlanRecepcion | null;
}

export interface RecepcionResumen {
  sociosActivos: number;
  pagosPendientes: number;
  turnosHoy: number;
  reservasHoy: number;
  sociosRecientes: SocioRecepcion[];
}

export interface PaginaSociosRecepcion {
  content: SocioRecepcion[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface CrearSocioRecepcion {
  dni: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  matricula: string;
  planId: number;
}

export interface CuotaRecepcion {
  id: number;
  mes: number;
  anio: number;
  importe: number;
  estado: string;
  fechaPago: string | null;
  socioId: number | null;
  nombreSocio: string | null;
  apellidosSocio: string | null;
  dni: string | null;
  nombrePlan: string | null;
}

export interface PaginaCuotasRecepcion {
  content: CuotaRecepcion[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ResumenCuotasRecepcion {
  totalCuotas: number;
  cuotasPagadas: number;
  cuotasPendientes: number;
  cuotasCanceladas: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecepcionService {

  private apiUrl = 'http://localhost:8081/recepcion';
  private sociosUrl = 'http://localhost:8081/socios';
  private planesUrl = 'http://localhost:8081/planes';

  constructor(private http: HttpClient) {}

  // DASHBOARD

  obtenerResumen(): Observable<RecepcionResumen> {
    return this.http.get<RecepcionResumen>(
      `${this.apiUrl}/resumen`
    );
  }

  // SOCIOS

  listarSocios(
    pagina: number = 0,
    tamanio: number = 20
  ): Observable<PaginaSociosRecepcion> {

    return this.http.get<PaginaSociosRecepcion>(
      `${this.sociosUrl}?page=${pagina}&size=${tamanio}`
    );
  }

  listarPlanes(): Observable<PlanRecepcion[]> {
    return this.http.get<PlanRecepcion[]>(this.planesUrl);
  }

  crearSocio(
    datos: CrearSocioRecepcion
  ): Observable<SocioRecepcion> {

    return this.http.post<SocioRecepcion>(
      this.sociosUrl,
      datos
    );
  }

  // CUOTAS

  listarCuotas(
    pagina: number = 0,
    tamanio: number = 20
  ): Observable<PaginaCuotasRecepcion> {

    return this.http.get<PaginaCuotasRecepcion>(
      `${this.apiUrl}/cuotas?page=${pagina}&size=${tamanio}`
    );
  }

  obtenerResumenCuotas(): Observable<ResumenCuotasRecepcion> {

    return this.http.get<ResumenCuotasRecepcion>(
      `${this.apiUrl}/cuotas/resumen`
    );
  }

  registrarPago(id: number): Observable<CuotaRecepcion> {

    return this.http.patch<CuotaRecepcion>(
      `${this.apiUrl}/cuotas/${id}/pagar`,
      null
    );
  }

}
