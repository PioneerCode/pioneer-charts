import { Component, Input } from '@angular/core';
import { IJumpNav, JumpNavComponent } from '../jump-nav/jump-nav.component';
import { DocNavComponent } from './doc-nav/dov-nav.component';

@Component({
    selector: 'app-doc-layout',
    templateUrl: './doc.component.html',
    styleUrls: ['./doc.component.scss'],
    imports: [
        JumpNavComponent,
        DocNavComponent
    ]
})
export class DocLayoutComponent {
  @Input() jumpNav!: IJumpNav[];
}
