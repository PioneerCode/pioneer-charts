import { Component, OnInit } from '@angular/core';
import { PcacService } from '../../services/pc.service';

@Component({
  selector: 'pc-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {
  constructor(public pcacService: PcacService) { }
}
