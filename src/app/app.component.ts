import { Component, OnInit } from '@angular/core';
import { ITableConfig } from './pcac/table/table.model';
import { PcacRepository } from './repository/pcac.repository';

@Component({
  selector: 'pcac-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Pioneer Code Angular Charts';
  tableConfig: ITableConfig;

  constructor(private repository: PcacRepository) { }

  ngOnInit() {
    this.repository.getTable()
      .subscribe(data => this.tableConfig = data);
  }
}
