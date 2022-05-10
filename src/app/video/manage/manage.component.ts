import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss'],
})
export class ManageComponent implements OnInit {
  videoOrder: string = '1';

  // constructor(private route: ActivatedRoute) {}
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // this.route.data.subscribe(console.log);
    // this.route.queryParams.subscribe(console.log);
    this.route.queryParams.subscribe((params: Params) => {
      // this.videoOrder = params.sort;

      // QuerParams can Be Easily Mocked in URL so for Safety will Use Ternary Operator
      this.videoOrder = params.sort === '2' ? params.sort : '1';
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
}
