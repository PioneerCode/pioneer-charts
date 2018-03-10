import { Component, OnInit, Input } from '@angular/core';
import { IHeaderConfig } from './header.model';

@Component({
  selector: 'pcac-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() config: IHeaderConfig;

  constructor() { }

  ngOnInit() {
  }

}
