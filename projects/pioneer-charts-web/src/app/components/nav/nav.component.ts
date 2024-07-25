import { Component } from '@angular/core';
import { AppService } from '../../app.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  standalone: true,
  imports: [ NgClass ],
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {

  constructor(public pcService: AppService) { }

  onHamburgerClick(): void {
    // if (this.pcService.navDisplay === 'none') {
    //   this.pcService.navDisplay = 'block';
    //   return;
    // }
    // this.pcService.navDisplay = 'none';
  }
}
