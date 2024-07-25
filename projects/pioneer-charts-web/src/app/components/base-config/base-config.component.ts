import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-base-config',
  templateUrl: './base-config.component.html',
  styleUrls: ['./base-config.component.scss'],
  standalone: true
})
export class BaseConfigComponent  {
  @Input() includeTickFormat = false;
  @Input() includeHideAxisAndGrid = false;
}
