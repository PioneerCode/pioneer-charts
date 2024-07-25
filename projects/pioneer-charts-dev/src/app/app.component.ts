import { Component, inject } from '@angular/core';
import { PcService } from './services/pc.service';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink
  ]
})
export class AppComponent {
  title = 'pioneer-charts-dev';

  readonly service = inject(PcService)

  ngOnInit() {
    this.service.getData();
  }
}
