import { Component, OnInit } from '@angular/core';
import { PcService } from '../../services/pc.service';

@Component({
  selector: 'pc-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {
  constructor(public pcacService: PcService) { }
}
