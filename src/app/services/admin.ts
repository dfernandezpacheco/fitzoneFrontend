import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DistribucionPlan {
  nombrePlan: string;
  totalSocios: number;
}

export interface PlanAdmin {
  id: number;
  nombre: string;
  precioMensual: number;
  tipo: string;
}

export interface GuardarPlan {
  nombre: string;
  precioMensual: number;
  tipo: string;
}

export interface AdminResumen {
  totalSocios: number;
  sociosActivos: number;
  sociosSuspendidos: number;
  totalPlanes: number;
  ingresosMes: number;
  cuotasPendientes: number;
  distribucionSociosPorPlan: DistribucionPlan[];
}

export interface SocioAdmin {
  id: number;
  dni: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  matricula: string | null;
  activo: boolean;
  fechaAlta: string;
  plan: PlanAdmin | null;
}

export interface PaginaSociosAdmin {
  content: SocioAdmin[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface CuotaAdmin {
  id: number;
  mes: number;
  anio: number;
  importe: number;
  estado: string;
  fechaPago: string | null;
  socioId: number;
  nombreSocio: string;
  apellidosSocio: string;
  dni: string;
  nombrePlan: string;
}

export interface PaginaCuotasAdmin {
  content: CuotaAdmin[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface IngresoMensualDto {
  mes: number;
  nombreMes: string;
  total: number;
}

export interface InformeAdminDto {
  anio: number;
  ingresosAnio: number;
  cuotasPagadas: number;
  cuotasPendientes: number;
  cuotasCanceladas: number;
  ingresosMensuales: IngresoMensualDto[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = 'http://localhost:8081/admin';

  constructor(private http: HttpClient) {}

  obtenerResumen(): Observable<AdminResumen> {
    return this.http.get<AdminResumen>(
      `${this.apiUrl}/resumen`
    );
  }

  listarPlanes(): Observable<PlanAdmin[]> {
    return this.http.get<PlanAdmin[]>(
      'http://localhost:8081/planes'
    );
  }

  crearPlan(datos: GuardarPlan): Observable<PlanAdmin> {
    return this.http.post<PlanAdmin>(
      `${this.apiUrl}/planes`,
      datos
    );
  }

  actualizarPlan(
    id: number,
    datos: GuardarPlan
  ): Observable<PlanAdmin> {
    return this.http.put<PlanAdmin>(
      `${this.apiUrl}/planes/${id}`,
      datos
    );
  }

  listarSocios(
    pagina: number = 0,
    tamanio: number = 100
  ): Observable<PaginaSociosAdmin> {

    return this.http.get<PaginaSociosAdmin>(
      `http://localhost:8081/socios?page=${pagina}&size=${tamanio}`
    );
  }

  cambiarEstadoSocio(
    id: number,
    activo: boolean
  ): Observable<SocioAdmin> {

    return this.http.patch<SocioAdmin>(
      `http://localhost:8081/socios/${id}/estado?activo=${activo}`,
      null
    );
  }

  listarCuotas(
    pagina: number = 0,
    tamanio: number = 20
  ): Observable<PaginaCuotasAdmin> {

    return this.http.get<PaginaCuotasAdmin>(
      `${this.apiUrl}/cuotas?page=${pagina}&size=${tamanio}`
    );
  }
  obtenerInforme(anio?: number): Observable<InformeAdminDto> {
    let url = `${this.apiUrl}/informes`;
    if (anio) {
      url += `?anio=${anio}`;
    }
    return this.http.get<InformeAdminDto>(url);
  }

}
