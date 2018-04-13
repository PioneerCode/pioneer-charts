import {
  Component,
  AfterViewInit,
  Input,
  ElementRef,
  Renderer2
} from '@angular/core';

@Component({
  selector: 'pc-prism',
  template: ``,
  styleUrls: ['./prism.component.scss']
})
export class PrismComponent implements AfterViewInit {
  @Input() code: string;
  @Input() language: string;
  private preNode: Element;
  private codeNode: Element;
  private nativeElement: Element;

  constructor(private _renderer: Renderer2, private _el: ElementRef) {
    this.nativeElement = _el.nativeElement;
  }

  ngAfterViewInit() {
    this.preNode = this._renderer.createElement('pre');
    this.codeNode = this._renderer.createElement('code');
    this._renderer.addClass(this.codeNode, 'language-' + this.language);
    this._renderer.addClass(this.preNode, 'pc-prism');
    this._renderer.appendChild(this.nativeElement, this.preNode);
    this._renderer.appendChild(this.preNode, this.codeNode);
    this.codeNode.textContent = this.code;
    Prism.highlightElement(this.codeNode, Prism.languages[this.language]);
  }
}
