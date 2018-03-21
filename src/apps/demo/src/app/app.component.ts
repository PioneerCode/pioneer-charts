import { Component, OnInit } from '@angular/core';
import { PcacRepository } from './repository/pcac.repository';
import { PcacService } from './services/pcac.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'pc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Pioneer Code Angular Charts';
  currentRoute = 'home';
  version = environment.version;

  constructor(private pcacService: PcacService) { }

  ngOnInit() {
    this.pcacService.getData();
  }
}
