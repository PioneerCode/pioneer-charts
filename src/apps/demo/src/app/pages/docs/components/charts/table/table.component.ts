import { Component, OnInit } from '@angular/core';
import { IJumpNav, JumpNavLevel } from '../../../../../components/jump-nav/jump-nav.component';
import { PcService } from '../../../../../services/pc.service';

@Component({
  selector: 'pc-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  jumpNav = [
    {
      key: 'Table',
      value: '',
      level: JumpNavLevel.h1
    },
    {
      key: 'Markup',
      value: 'markup',
      level: JumpNavLevel.h2
    },
    {
      key: 'API',
      value: 'api',
      level: JumpNavLevel.h2
    },
    {
      key: 'Configuration',
      value: 'configuration',
      level: JumpNavLevel.h3
    }
  ] as IJumpNav[];

  constructor(public pcService: PcService) { }

  ngOnInit() {
  }

}
