import { Component, OnInit } from '@angular/core';
import { IJumpNav } from '../../../layouts/doc/doc.component';

@Component({
  selector: 'pc-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit {
  jumpNav = [
  ] as IJumpNav[];
  constructor() { }

  ngOnInit() {
  }

}
