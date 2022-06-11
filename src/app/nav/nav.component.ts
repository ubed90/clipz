import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, Observer, Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit, OnDestroy {
  // isAuthenticated: boolean = false;
  // time = new Observable<string>((observer: Observer<string>) => {
  //   setInterval(() => observer.next(new Date().toString()), 1000);
  // });

  userName: string = '';
  userNameSubscription$: Subscription = new Subscription();

  // Opening and Closing Nav on Mobile Device
  isOpened: boolean = false;

  constructor(
    public modal: ModalService,
    public auth: AuthService,
    private fbAuth: AngularFireAuth
  ) {
    // this.auth.isAuthenticated$.subscribe((status) => {
    //   this.isAuthenticated = status;
    // });
  }

  ngOnInit(): void {
    this.userNameSubscription$ = this.fbAuth.user.subscribe((user) => {
      this.userName = user?.displayName as string;
    });
  }

  ngOnDestroy(): void {
    this.userNameSubscription$.unsubscribe();
  }

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

  toggleNav() {
    this.isOpened = !this.isOpened;
  }
}
