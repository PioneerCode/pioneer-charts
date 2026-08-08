import { Component, inject, signal } from '@angular/core';
import { AppService, MainRoutes } from '../../app.service';
import { NgClass } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-layout-footer',
  imports: [
    NgClass,
    RouterLink,
    MatDividerModule
  ],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
})
export class LayoutFooter {
  readonly service = inject(AppService)

  version = signal<string>("this.service.version");
  MainRoutes = MainRoutes;
}
