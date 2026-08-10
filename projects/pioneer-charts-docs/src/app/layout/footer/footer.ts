import { Component, inject, signal } from '@angular/core';
import { AppService, MainRoutes } from '../../app.service';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-layout-footer',
  imports: [
    RouterLink,
    MatDividerModule
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class LayoutFooter {
  readonly service = inject(AppService)

  // Kept in sync with projects/pioneer-charts/package.json's published version.
  version = signal<string>('22.0.4');
  MainRoutes = MainRoutes;
}
