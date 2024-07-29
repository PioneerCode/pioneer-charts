import { Component, inject } from '@angular/core';
import { PcService } from '../services/pc.service'
import { IPcacBarVerticalChartConfig, IPcacData, PcacBarVerticalChartComponent } from '@pioneer-code/pioneer-charts';

@Component({
  selector: 'pc-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
  standalone: true,
  imports: [
    PcacBarVerticalChartComponent
  ]
})
export class TestComponent {
  readonly service = inject(PcService)
  data: IPcacBarVerticalChartConfig = {
    "domainMax": 1000,
    "height": 200,
    "isStacked": false,
    "numberOfTicks": 5,
    "thresholds": [
    ],
    "data": [
      {
        "key": "7/29",
        "data":  [
          {
            "value": 687,
            "hide": false
          },
          {
            "value": 400,
            "hide": false
          }
        ]
      },
      {
        "key": "7/30",
        "data": [
          {
            "value": 327,
            "hide": false
          },
          {
            "value": 234,
            "hide": false
          }
        ]
      },
      {
        "key": "7/31",
        "data": [
          {
            "value": 888,
            "hide": false
          },
          {
            "value": 598,
            "hide": false
          }
        ]
      },
      {
        "key": "8/1",
        "data": [
          {
            "key": "Week 1",
            "value": 765,
            "hide": false
          },
          {
            "key": "Week 2",
            "value": 631,
            "hide": false
          }
        ]
      },
      {
        "key": "8/2",
        "data": [
          {
            "key": "Week 1",
            "value": 198,
            "hide": false
          },
          {
            "key": "Week 2",
            "value": 100,
            "hide": false
          }
        ]
      }
    ] as IPcacData[]
  }
}
