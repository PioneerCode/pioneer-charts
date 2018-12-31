import { Component } from '@angular/core';

import { IJumpNav, JumpNavLevel } from '../../../../../components/jump-nav/jump-nav.component';
import { PcService } from '../../../../../services/pc.service';
import { IPcacData } from 'projects/pcac/src/lib/core/public_api';

@Component({
  selector: 'pc-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent {
  jumpNav = [
    {
      key: 'Table',
      value: 'table',
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
    },
    {
      key: 'Events',
      value: 'event',
      level: JumpNavLevel.h2
    },
    {
      key: 'Contract',
      value: 'contract',
      level: JumpNavLevel.h2
    }
  ] as IJumpNav[];
  markupCode = `<pcac-table [config]="config" (deleteClicked)="onDeleteClicked($event)" (editClicked)="onEditClicked($event)"></pcac-table>`;
  importCode = `import { PcacTableModule } from '@pioneer-code/pioneer-charts';`;

  constructor(public pcService: PcService) { }

  onEditClicked(row: IPcacData): void {
    alert("Edit Row");
  }

  onDeleteClicked(row: IPcacData): void {
    alert("Delete Row");
  }
}
