import {
  Component,
  input
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-layout-code',
  templateUrl: './code.html',
  imports: [
    MatCardModule
  ],
  styleUrls: ['./code.scss'],
  
})
export class LayoutCode {
  readonly code = input.required<string>();
  readonly setMax = input(false);
}
