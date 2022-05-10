import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, delay, filter, switchMap } from 'rxjs/operators';
import IUser from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usersCollection: AngularFirestoreCollection<IUser>;
  public isAuthenticated$: Observable<boolean>;
  public isAuthenticatedWithDelay$: Observable<boolean>;
  private redirect: boolean = false;
  public userName: string | null | undefined = '';

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.usersCollection = db.collection('users');
    // this.auth.user.subscribe(console.log);
    this.isAuthenticated$ = auth.user.pipe(map((user) => !!user));

    this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(delay(1000));

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map((_event) => this.route.firstChild),
        switchMap((route) => route?.data ?? of({}))
      )
      .subscribe((data) => {
        this.redirect = data.authOnly ?? false;
      });

    this.auth.user.subscribe((user) => (this.userName = user?.displayName));
  }

  public async createUser(userData: IUser) {
    if (!userData.password) {
      throw new Error('Password Not Provided');
    }

    const userCred = await this.auth.createUserWithEmailAndPassword(
      userData.email,
      userData.password
    );
    // console.log(userCred);

    if (!userCred.user) {
      throw new Error("User Can't Be Found");
    }

    // await this.db.collection<IUser>('users').add({
    await this.usersCollection.doc(userCred.user.uid).set({
      name: userData.name,
      email: userData.email,
      age: userData.age,
      phoneNumber: userData.phoneNumber,
    });

    await userCred.user.updateProfile({
      displayName: userData.name,
    });
  }

  public async authenticateUser(userCredentials: {
    email: string;
    password: string;
  }) {
    const userData = await this.auth.signInWithEmailAndPassword(
      userCredentials.email,
      userCredentials.password
    );
  }

  public async signOut() {
    await this.auth.signOut();

    if (this.redirect) {
      await this.router.navigateByUrl('/');
    }

    this.userName = '';
  }
}
