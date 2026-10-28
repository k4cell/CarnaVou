import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { MenuInferior } from './menu/menu-inferior';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MenuInferior],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
