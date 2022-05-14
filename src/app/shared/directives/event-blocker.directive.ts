import {
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
} from '@angular/core';

@Directive({
  selector: '[app-event-blocker]',
})
export class EventBlockerDirective {
  // constructor(private el: ElementRef) {}
  constructor(private el: ElementRef) {}

  @HostBinding('style.backgroundColor') bgColor: any;

  @HostListener('drop', ['$event'])
  @HostListener('dragover', ['$event'])
  public handleEvent(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }

  // @HostListener('mouseenter')
  // mouseenter() {
  //   this.bgColor = this.favColor;
  //   this.el.nativeElement.classList.add('hover:bg-indigo-400');
  // }

  // @HostListener('mouseleave')
  // mouseleave() {
  //   this.bgColor = 'initial';
  // }
}
