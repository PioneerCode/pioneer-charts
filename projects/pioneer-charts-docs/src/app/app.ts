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
  private readonly service = inject(AppService)

  ngOnInit() {
    this.service.getData();
  }
}