import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';

@Component({
    selector: 'app-public-layout',
    templateUrl: './public.component.html',
    imports: [FooterComponent]
})
export class PublicLayoutComponent {
}
