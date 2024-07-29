import { JsonPipe } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

@Component({
  selector: 'app-code',
  templateUrl: './code.component.html',
  standalone: true,
  imports: [
   JsonPipe
  ]
})
export class CodeComponent {
  @Input() code!: string;
  @Input() language!: string;
}
