import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.scss'],
})
export class ClipComponent implements OnInit {
  id: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // this.id = this.route.snapshot.params.id;
    this.route.params.subscribe((params: Params) => {
      this.id = params.id;
    });
    console.log(this.id);
  }
}
