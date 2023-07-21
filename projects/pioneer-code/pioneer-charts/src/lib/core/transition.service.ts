import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PcacTransitionService {
  private transitionDuration = 750;

  getTransitionDuration(): number {
    return this.transitionDuration;
  }
}
