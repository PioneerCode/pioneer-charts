import { Component, OnInit } from '@angular/core';
import { AppService } from '../../app.service';

@Component({
  selector: 'pc-doc-nav',
  templateUrl: './doc-nav.component.html',
  styleUrls: ['./doc-nav.component.scss']
})
export class DocNavComponent {
  constructor(public pcService: AppService) { }
}
