import { Component, OnInit } from '@angular/core';
import { IJumpNav } from '../../../layouts/doc/doc.component';

@Component({
  selector: 'pc-data-contract',
  templateUrl: './data-contract.component.html',
  styleUrls: ['./data-contract.component.scss']
})
export class DataContractComponent implements OnInit {
  jumpNav = [
  ] as IJumpNav[];

  data = `export interface IPcacData {
  key: string | number;
  value: string | number;
  data: IPcacData[];
}`;

  baseConfig = `export interface IPcacChartConfig {
  /**
   * Height in pixels
   */
  height: number;
  data: IPcacData[];
  ...
}`;

  constructor() { }

  ngOnInit() {
  }

}
