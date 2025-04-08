import { JsonPipe } from '@angular/common';
import {
  Component,
  input
} from '@angular/core';

@Component({
    selector: 'app-code',
    templateUrl: './code.component.html',
    imports: [
        JsonPipe
    ]
})
export class CodeComponent {
  readonly code = input.required<string>();
  readonly language = input.required<string>();
}
