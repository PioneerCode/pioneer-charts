import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface IJumpNav {
  key: string;
  value: string;
}

@Component({
  selector: 'app-layout-jump-nav',
  imports: [
    RouterLink
  ],
  templateUrl: './jump-nav.html',
  styleUrls: ['./jump-nav.scss']
})
export class LayoutJumpNav {
  readonly jumpNav = input<IJumpNav[]>([]);
}
