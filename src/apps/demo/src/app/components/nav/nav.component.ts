import { Component, OnInit } from '@angular/core';
import { PcService } from '../../services/pc.service';

@Component({
  selector: 'pc-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {
  navDisplay = 'none';
  constructor(public pcacService: PcService) { }

  onHamburgerClick(): void {
    if (this.navDisplay === 'none') {
      this.navDisplay = 'flex';
      return;
    }
    this.navDisplay = 'none';
  }
}
