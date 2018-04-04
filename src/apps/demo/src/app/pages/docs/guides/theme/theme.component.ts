import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'pc-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss']
})
export class ThemeComponent implements OnInit {
  importStylesCode = `@import "~@pioneer-code/pioneer-charts/pcac.css";`;
  constructor() { }

  ngOnInit() {
  }

}
