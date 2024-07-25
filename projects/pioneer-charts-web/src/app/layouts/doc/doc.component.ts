import { Component, Input } from '@angular/core';
import { IJumpNav } from '../../components/jump-nav/jump-nav.component';

@Component({
  selector: 'app-doc-layout',
  templateUrl: './doc.component.html',
  styleUrls: ['./doc.component.scss'],
  standalone: true
})
export class DocLayoutComponent {
  @Input() jumpNav!: IJumpNav[];
}
