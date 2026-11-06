import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { MembresiaComponent } from './pages/membresia/membresia';
import { ClasesComponent } from './pages/clases/clases';
import { LoginComponent } from './pages/login/login';
import { SocioDashboardComponent } from './pages/dashboard/dashboard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  { path: 'landing', component: Landing },
  { path: 'clases', component: ClasesComponent },
  { path: 'login', component: LoginComponent },
  { path: 'membresia', component: MembresiaComponent },
  {path: 'socio/dashboard', component: SocioDashboardComponent, canActivate: [authGuard]}

];
