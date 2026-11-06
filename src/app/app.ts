import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title: string = 'fitzoneFrontend';

  constructor(public router: Router) {}

  // Esta función devuelve true si estamos en el login o en el área de socio
  esRutaSinHeader(): boolean {
    return this.router.url.startsWith('/socio') || this.router.url === '/login';
  }
}
