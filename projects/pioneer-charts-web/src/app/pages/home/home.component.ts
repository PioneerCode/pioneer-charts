import { Component } from '@angular/core';
import { PcService } from '../../app.service';

@Component({
  selector: 'pc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(public pcService: PcService) { }
}
