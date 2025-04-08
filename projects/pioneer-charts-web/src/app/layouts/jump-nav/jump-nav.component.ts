import { NgClass } from '@angular/common';
import { Component, OnInit, AfterViewChecked, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

export enum JumpNavLevel {
  h1,
  h2,
  h3
}

export interface IJumpNav {
  key: string;
  value: string;
  level: JumpNavLevel;
}

@Component({
    selector: 'app-jump-nav',
    templateUrl: './jump-nav.component.html',
    styleUrls: ['./jump-nav.component.scss'],
    imports: [
        NgClass,
        RouterLink,
    ]
})
export class JumpNavComponent implements OnInit, AfterViewChecked {
  private route = inject(Router);

  readonly jumpNav = input<IJumpNav[]>([]);
  currentRoute: string[] = []
  fragment!: string;

  constructor() {
    this.route.events.subscribe((res) => {
      this.currentRoute = [this.route.url];
      if (this.currentRoute[0].includes('#')) {
        this.currentRoute[0] = this.currentRoute[0].substring(0, this.currentRoute[0].indexOf('#'));
      }
    });
  }

  ngOnInit() {
    // this.activeRoute.fragment.subscribe(fragment => { this.fragment = fragment === null || fragment === '' ? undefined : fragment; });
  }

  ngAfterViewChecked(): void {
    const elm = document.querySelector('#' + this.fragment);
    if (this.fragment && elm) {
      elm.scrollIntoView();
      window.scrollBy(0, -54);
    }
  }

  getLevelClass(jump: IJumpNav) {
    const styles = [] as string[];
    switch (jump.level) {
      case JumpNavLevel.h1:
        styles.push('level-1');
        break;
      case JumpNavLevel.h2:
        styles.push('level-2');
        break;
      case JumpNavLevel.h3:
        styles.push('level-3');
        break;
    }

    if (jump.level === JumpNavLevel.h1 && !this.fragment || jump.value === this.fragment) {
      styles.push('active');
    }
    return styles;
  }
}
