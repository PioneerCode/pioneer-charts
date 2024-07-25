import { Component, inject } from '@angular/core';
import { AppService } from '../../app.service';
import { PcacLineAreaChartComponent } from '@pioneer-code/pioneer-charts';
import { PublicComponent } from '../../layouts/public/public.component';

@Component({
  selector: 'pc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports:[
    PublicComponent,
    PcacLineAreaChartComponent
  ]
})
export class HomeComponent {
  readonly service = inject(AppService)
}
