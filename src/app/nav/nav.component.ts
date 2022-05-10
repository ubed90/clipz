import { Component, OnInit } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
  // isAuthenticated: boolean = false;
  // time = new Observable<string>((observer: Observer<string>) => {
  //   setInterval(() => observer.next(new Date().toString()), 1000);
  // });

  constructor(public modal: ModalService, public auth: AuthService) {
    // this.auth.isAuthenticated$.subscribe((status) => {
    //   this.isAuthenticated = status;
    // });
  }

  ngOnInit(): void {}

  openModal(_$event: Event): void {
    _$event.preventDefault();

    this.modal.toggleModal('auth');
  }

  async logout($event?: Event) {
    if ($event) {
      $event.preventDefault();
    }

    await this.auth.signOut();
  }
}
