import { Injectable } from '@angular/core';

export class PcacTransitionService {
  private transitionDuration = 750;

  getTransitionDuration(): number {
    return this.transitionDuration;
  }
}
