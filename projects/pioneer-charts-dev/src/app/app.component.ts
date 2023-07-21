import { Component } from '@angular/core';
import { PcService } from './services/pc.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'pioneer-charts-dev';

  constructor(
    public pcacService: PcService) { }

  ngOnInit() {
    this.pcacService.getData();
  }
}
