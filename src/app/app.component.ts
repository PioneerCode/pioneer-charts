import { Component } from '@angular/core';
import { ITableConfig } from './charts/table/table.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Pioneer Code Angular Charts';

  tableConfig = {

  } as ITableConfig;
}
