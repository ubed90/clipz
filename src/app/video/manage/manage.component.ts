import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css'],
})
export class ManageComponent implements OnInit {
  videoOrder: string = '1';

  clips: IClip[] = [];

  activeClip: IClip | null = null;

  // To Sort Clips we will Define one Subject to push / emit values whenever Order Changes
  sort$: BehaviorSubject<string>;

  // constructor(private route: ActivatedRoute) {}
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clipsService: ClipService,
    private modal: ModalService
  ) {
    this.sort$ = new BehaviorSubject(this.videoOrder);
    // this.sort$.subscribe(console.log);
    // this.sort$.next('test');
  }

  ngOnInit(): void {
    // To get Soreting mechanism attached with the link as Query Params

    // this.route.data.subscribe(console.log);
    // this.route.queryParams.subscribe(console.log);
    this.route.queryParams.subscribe((params: Params) => {
      // this.videoOrder = params.sort;

      // QuerParams can Be Easily Mocked in URL so for Safety will Use Ternary Operator
      this.videoOrder = params.sort === '2' ? params.sort : '1';

      // Passing the latest Sorting order to Sort$ observable
      this.sort$.next(this.videoOrder);
    });

    // To get all the Clips uploaded by the user on firebase
    // this.clipsService.getUserClips().subscribe(console.log);

    // We will also pass Behaviour subject as an Observable to this method so that we can pass our Sorting order to firebase to fetch values
    this.clipsService.getUserClips(this.sort$).subscribe((docs) => {
      this.clips = [];

      // console.log(docs[0].data());

      // First we will Subscribe than Get the Array of Document reference Objects and

      // Then we will iterate on all of them and call data function to all docsa to get the data which we are interested in

      docs.forEach((doc) => {
        this.clips.push({
          docID: doc.id,
          ...doc.data(),
        });
      });
    });
  }

  sort(event: Event) {
    const { value } = event.target as HTMLSelectElement;

    // Easy to Implement . Less PowerFull
    // this.router.navigateByUrl(`/manage?sort=${value}`);

    // Higher Learning Curve. Efficient and PowerFull implementation
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sort: value,
      },
    });
  }

  openModal($event: Event, clip: IClip) {
    $event.preventDefault();

    this.activeClip = clip;

    this.modal.toggleModal('editCLip');
  }

  update($event: IClip) {
    this.clips.forEach((element, index) => {
      if (element.docID === $event.docID) {
        this.clips[index].title = $event.title;
      }
    });

    // Closing the modal after Successfull Edit of Clip

    setTimeout(() => {
      this.modal.toggleModal('editCLip');
    }, 500);
  }

  deleteClip($event: Event, clip: IClip) {
    $event.preventDefault();

    this.clipsService.deleteClip(clip);

    this.clips.forEach((element, index) => {
      if (element.docID === clip.docID) {
        this.clips.splice(index, 1);
      }
    });
  }

  async copyToClipboard($event: Event , docID: string | undefined) {
    $event.preventDefault();

    if(!docID) {
      return;
    }

    const url = `${location.origin}/clip/${docID}`

    await navigator.clipboard.writeText(url);

    alert('Link Copied')
  }
}
