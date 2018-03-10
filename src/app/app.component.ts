import { Component } from '@angular/core';
import { ITableConfig, ITableLabel } from './charts/table/table.model';
import { IData } from './charts/data.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Pioneer Code Angular Charts';

  tableConfig = {
    data: [

    ] as IData[],
    labels: [
      {
        text: 'Hi'
      },
      {
        text: 'I Am'
      },
      {
        text: 'A Pretty'
      },
      {
        text: 'Table'
      }
    ] as ITableLabel[]
  } as ITableConfig;
}
