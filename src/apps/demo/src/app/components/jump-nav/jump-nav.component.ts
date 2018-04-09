import { Component, Input, OnInit, AfterViewInit, AfterViewChecked } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

export interface IJumpNav {
  key: string;
  value: string;
  jump: IJumpNav[];
}

@Component({
  selector: 'pc-jump-nav',
  templateUrl: './jump-nav.component.html',
  styleUrls: ['./jump-nav.component.scss']
})
export class JumpNavComponent implements OnInit, AfterViewChecked {
  @Input() jumpNav: IJumpNav[];
  currentRoute: string[];
  fragment: string;
  constructor(
    private activeRoute: ActivatedRoute,
    private route: Router
  ) {
    this.route.events.subscribe((res) => {
      this.currentRoute = [this.route.url];
      if (this.currentRoute[0].includes('#')) {
        this.currentRoute[0] = this.currentRoute[0].substring(0, this.currentRoute[0].indexOf('#'));
      }
    });
  }

  ngOnInit() {
    this.activeRoute.fragment.subscribe(fragment => { this.fragment = fragment; });
  }

  ngAfterViewChecked(): void {
    console.log(this.currentRoute);
    console.log(this.fragment);
    if (this.fragment) {
      document.querySelector('#' + this.fragment).scrollIntoView();
      window.scrollBy(0, -54);
    }
  }
}
