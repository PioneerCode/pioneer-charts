import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-layout-header',
  imports: [
    RouterLink, 
    MatToolbarModule,
    MatButtonModule,
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class LayoutHeader {

}
