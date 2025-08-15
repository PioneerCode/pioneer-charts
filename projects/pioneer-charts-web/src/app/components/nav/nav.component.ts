import { Component, inject } from '@angular/core';
import { AppService } from '../../app.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  imports: [ NgClass ],
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {
  readonly pcService = inject(AppService);

  onHamburgerClick(): void {
    // if (this.pcService.navDisplay === 'none') {
    //   this.pcService.navDisplay = 'block';
    //   return;
    // }
    // this.pcService.navDisplay = 'none';
  }
}
