import { Component, inject } from '@angular/core';
import { AppService } from '../../app.service';
import { PcacLineAreaChartComponent } from '@pioneer-code/pioneer-charts';
import { PublicLayoutComponent } from '../../layouts/public/public.component';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'pc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports:[
    RouterLink,
    MatButtonModule,
    PublicLayoutComponent,
    PcacLineAreaChartComponent
  ]
})
export class HomeComponent {
  readonly service = inject(AppService)
}
