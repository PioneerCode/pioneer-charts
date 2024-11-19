import { Component, inject } from '@angular/core';
import { AppService } from '../../app.service';
import { PcacLineAreaChartComponent } from '@pioneer-code/pioneer-charts';
import { PublicLayoutComponent } from '../../layouts/public/public.component';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'pc-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    imports: [
        RouterLink,
        MatButtonModule,
        MatCardModule,
        PublicLayoutComponent,
        PcacLineAreaChartComponent
    ]
})
export class HomeComponent {
  readonly service = inject(AppService)
}
