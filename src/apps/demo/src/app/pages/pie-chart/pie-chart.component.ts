import { Component, OnInit } from '@angular/core';
import { PcService } from '../../services/pc.service';

@Component({
  selector: 'pc-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnInit {
  constructor(public pcService: PcService) { }

  ngOnInit() {
  }
}
