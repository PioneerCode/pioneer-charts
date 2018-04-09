import { Component, OnInit } from '@angular/core';
import { IJumpNav } from '../../../../../components/jump-nav/jump-nav.component';
import { PcService } from '../../../../../services/pc.service';

@Component({
  selector: 'pc-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  jumpNav = [
    {
      key: 'Markup',
      value: 'markup'
    },
    {
      key: 'API',
      value: 'api',
      jump: [
        {
          key: 'Configuration',
          value: 'configuration',
        }
      ]
    }
  ] as IJumpNav[];

  constructor(public pcService: PcService) { }

  ngOnInit() {
  }

}
