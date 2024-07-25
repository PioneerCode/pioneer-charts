import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-public-layout',
  templateUrl: './public.component.html',
  standalone: true,
  imports: [FooterComponent]
})
export class PublicLayoutComponent {
}
