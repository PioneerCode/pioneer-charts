import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppService } from './app.service';
import { LayoutHeader } from './layout/header/header';
import { LayoutFooter } from './layout/footer/footer';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    LayoutHeader,
    LayoutFooter
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Pioneer Charts');

  constructor() {
    // Eagerly instantiate the root-scoped AppService here so its toSignal()-backed
    // chart configs start loading at app bootstrap instead of on first use.
    inject(AppService);
  }
}