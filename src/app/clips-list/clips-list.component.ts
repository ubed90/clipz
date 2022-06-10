import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ClipService } from '../services/clip.service';

@Component({
  selector: 'app-clips-list',
  templateUrl: './clips-list.component.html',
  styleUrls: ['./clips-list.component.css'],
  providers: [DatePipe],
})
export class ClipsListComponent implements OnInit, OnDestroy {
  // For Enabling / Disabling Infinite Scrolling on our Demand
  @Input() scrollable: boolean = true;

  constructor(public clipService: ClipService) {
    this.clipService.getClips();
  }

  ngOnInit(): void {
    // For Inifintie Scrolling Effect
    if (this.scrollable) {
      window.addEventListener('scroll', this.handleScroll);
    }
  }

  ngOnDestroy(): void {
    // Remove Listener when user navigates to another page in order to prevent Memory Leaks
    if (this.scrollable) {
      window.removeEventListener('scroll', this.handleScroll);
    }

    this.clipService.pageClips = [];
  }

  // !! Important this function to be an Arrow function to preserve this context
  handleScroll = () => {
    // Offset Height is Height of the Page , Document  basically height of our website
    // ScrollTop is the distance of our viewbale area covered fromt the Top

    const { scrollTop, offsetHeight } = document.documentElement;

    // Height of the Viewable Area
    const { innerHeight } = window;

    const bottomOfWindow = Math.round(scrollTop) + innerHeight === offsetHeight;

    if (bottomOfWindow) {
      this.clipService.getClips();
      console.log('Reached Bottom');
    }
  };
}
