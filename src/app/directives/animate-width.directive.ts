// animate-width.directive.ts
import {Directive, ElementRef, Renderer2, AfterViewInit, OnDestroy} from '@angular/core';

@Directive({
  selector: '[appAnimateWidth]',
  standalone: true
})
export class AnimateWidthDirective implements AfterViewInit, OnDestroy {
  private observer?: MutationObserver;
  private oldWidth: number;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    const element = this.el.nativeElement;

    this.oldWidth = element.getBoundingClientRect().width;

    this.observer = new MutationObserver(() => this.handleChange());
    this.observer.observe(element, {
      characterData: true,
      childList: true,
      subtree: true
    });
  }

  private handleChange(): void {
    const element = this.el.nativeElement;
    const naturalWidth = element.getBoundingClientRect().width;

    if (Math.abs(naturalWidth - this.oldWidth) < 1) {
      return;
    }

    this.renderer.setStyle(element, 'width', `${this.oldWidth}px`);
    element.getBoundingClientRect();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.renderer.setStyle(element, 'width', `${naturalWidth}px`);
      });
    });

    this.oldWidth = naturalWidth;
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
