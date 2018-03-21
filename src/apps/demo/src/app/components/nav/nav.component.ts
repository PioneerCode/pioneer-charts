import { Component, OnInit } from '@angular/core';
import { PcacService } from '../../services/pcac.service';

@Component({
  selector: 'pc-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {
  constructor(private pcacService: PcacService) { }
}
