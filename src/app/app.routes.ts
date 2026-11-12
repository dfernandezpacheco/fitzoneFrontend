import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { MembresiaComponent } from './pages/membresia/membresia';
import { ClasesComponent } from './pages/clases/clases';
import { LoginComponent } from './pages/login/login';
import { RegistroComponent } from './pages/registro/registro';
import { SocioDashboardComponent } from './pages/dashboard/dashboard';
import { MiFichaComponent } from './pages/mi-ficha/mi-ficha';
import { AdminDashboardComponent } from './pages/admin/dashboard/dashboard';
import { roleGuard } from './guards/role.guard';
import {ReceptionDashboardComponent} from './pages/recepcion/dashboard/dashboard';
import { AdminPlanesComponent } from './pages/planes/planes';
import { AdminEstadosComponent } from './pages/admin/estados/estados'
import { AdminCuotasComponent } from './pages/admin/cuotas/cuotas';

export const routes: Routes = [
  // PÁGINAS PÚBLICAS
  {path: '', redirectTo: 'landing', pathMatch: 'full'},
  {path: 'landing', component: Landing},
  {path: 'clases', component: ClasesComponent},
  {path: 'membresia', component: MembresiaComponent},
  {path: 'login', component: LoginComponent},
  {path: 'registro', component: RegistroComponent},
  // ZONA DEL SOCIO
  {path: 'socio/dashboard', component: SocioDashboardComponent, canActivate: [roleGuard], data: {roles: [3]}},
  {path: 'socio/mi-ficha', component: MiFichaComponent, canActivate: [roleGuard], data: {roles: [3]}},
  // ZONA ADMINISTRATIVA
  {path: 'admin', redirectTo: 'admin/dashboard', pathMatch: 'full'},
  {path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [roleGuard], data: {roles: [1]}},
  {path: 'admin/planes', component: AdminPlanesComponent, canActivate: [roleGuard], data: { roles: [1] }},
  {path: 'admin/estados', component: AdminEstadosComponent, canActivate: [roleGuard], data: { roles: [1] }},
  {path: 'admin/cuotas', component: AdminCuotasComponent, canActivate: [roleGuard], data: { roles: [1] }},
  {path: 'informes', loadComponent: () => import('./pages/admin/informes/informes').then(m => m.Informes)
  }
  // ZONA DE RECEPCIÓN
  {path: 'recepcion', redirectTo: 'recepcion/dashboard', pathMatch: 'full'},
  {path: 'recepcion/dashboard', component: ReceptionDashboardComponent, canActivate: [roleGuard], data: {roles: [1, 2]}}

];

