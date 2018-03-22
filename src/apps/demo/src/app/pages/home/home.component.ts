import { Component, OnInit } from '@angular/core';
import { PcacService } from '../../services/pc.service';

@Component({
  selector: 'pc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(public pcacService: PcacService) { }
}
