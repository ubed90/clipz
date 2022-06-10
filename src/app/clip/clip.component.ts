import { DatePipe } from '@angular/common';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import videojs from 'video.js';
import IClip from '../models/clip.model';

@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.css'],
  providers: [DatePipe],
  encapsulation: ViewEncapsulation.None,
})
export class ClipComponent implements OnInit {
  // Only Required for Demosntration of Activated Route
  // id: string = '';

  // Selecting Video Tag using ViewChild
  @ViewChild('videoPlayer', { static: true }) target?: ElementRef;

  // Creatring and Object of VideoJs Library
  player?: videojs.Player;

  // getting the Current Clip file from Route Using Resolve
  clip?: IClip;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // initializing the player varaiable with VideoJs Function
    this.player = videojs(this.target?.nativeElement);

    // Demonstration Purpose
    // this.id = this.route.snapshot.params.id;
    // this.route.params.subscribe((params: Params) => {
    //   this.id = params.id;
    // });
    // console.log(this.id);

    this.route.data.subscribe((data) => {
      // Type assertion since our Resolver Object doesn't know which type of data to return
      this.clip = data.clip as IClip;

      // Dynamically changing Src of Player
      this.player?.src({
        src: this.clip.url,
        type: 'video/mp4',
      });
    });
  }
}
