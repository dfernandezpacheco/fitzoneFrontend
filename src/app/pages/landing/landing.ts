import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import {Header, HeaderComponent} from '../../components/header/header';
import {Footer} from '../../components/footer/footer';

@Component({
  imports: [RouterLink, Header, Footer],
  selector: 'app-landing',
  styleUrl: './landing.css',
  templateUrl: './landing.html',
})
export class Landing {}
