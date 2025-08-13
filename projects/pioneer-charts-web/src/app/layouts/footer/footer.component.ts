import { Component, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AppService } from '../../app.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [
    NgClass
  ]
})
export class FooterComponent {
  version = environment.version
  readonly service = inject(AppService)
}
