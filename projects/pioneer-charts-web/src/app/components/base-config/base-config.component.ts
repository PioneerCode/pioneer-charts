import { Component, input } from '@angular/core';

@Component({
  selector: 'app-base-config',
  templateUrl: './base-config.component.html',
  styleUrls: ['./base-config.component.scss']
})
export class BaseConfigComponent  {
  readonly includeTickFormat = input(false);
  readonly includeHideAxisAndGrid = input(false);
}
