import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentReference,
  QuerySnapshot,
} from '@angular/fire/compat/firestore';
import { async } from '@firebase/util';
import IClip from '../models/clip.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { switchMap, map } from 'rxjs/operators';
import { of, BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
// Resolver to Load video before Loading Clip page
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ClipService implements Resolve<IClip | null> {
  public clipsCollection: AngularFirestoreCollection<IClip>;

  // TO store already loaded clips
  pageClips: IClip[] = [];

  // Just to be sure only one request is made when the user reaches the bottom;
  pendingReq: boolean = false;

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private router: Router
  ) {
    this.clipsCollection = db.collection('clips');
  }

  // Function to Reference Uploaded Clip Info with The User

  createClip(data: IClip): Promise<DocumentReference<IClip>> {
    return this.clipsCollection.add(data);
  }

  // Function to get All the clips assosciated with a User

  getUserClips(sort$: BehaviorSubject<string>) {
    return combineLatest([this.auth.user, sort$]).pipe(
      // SwicthMap to subscibe to Inner Observable by Passing user Object and Using its Uid to generate one Query to Fetch data from DB
      switchMap((values) => {
        const [user, sort] = values;

        if (!user) {
          return of([]);
        }

        const query = this.clipsCollection.ref
          .where('uid', '==', user.uid)
          .orderBy('timestamp', sort === '1' ? 'desc' : 'asc');

        // This call returns a Promise which contains an array with Objects which are Type of Documents reference of Firebase
        return query.get();
      }),
      // We want to fetch only the property which containes the array of DOcument reference Objects
      map((snapshot) => (snapshot as QuerySnapshot<IClip>).docs)
    );
  }

  // Function to Update clip title
  updateClip(id: string, title: string) {
    return this.clipsCollection.doc(id).update({ title: title });
  }

  async deleteClip(clip: IClip) {
    const clipRef = this.storage.ref(`clips/${clip.fileName}`);
    const screenshotRef = this.storage.ref(
      `screenshots/${clip.screenshotFileName}.png`
    );

    clipRef.delete();
    screenshotRef.delete();

    await this.clipsCollection.doc(clip.docID).delete();
  }

  // Get All clips from Storage for Infinite Scrolling
  async getClips() {
    // If there is any previously initiated Request then function should not run
    if (this.pendingReq) {
      return;
    }

    this.pendingReq = true;
    // To get the latest clips from storage we are querying to return in the descending order and limiting only 6 values for Infinite scrolling
    let query = this.clipsCollection.ref.orderBy('timestamp', 'desc').limit(6);

    // To check whether the page has clips loaded or not to prevent duplicate fetches form Firebase
    const { length } = this.pageClips;

    // If there are clips fetched from DB
    if (length) {
      // then we will fetch the docID last clip fetched from pageclips array
      const lastDocID = this.pageClips[length - 1].docID;
      // But inorder to get the clips after the last clip we need snapshot of that clip as well.
      // Only docID will not work so we will query the DB using doc function by passing lastDocID as parameter
      // Since doc() function returns Observable we will chain toPromise() to convert it into promise

      // Pro Tip :- get() function returns data in random order
      const lastDoc = await this.clipsCollection
        .doc(lastDocID)
        .get()
        .toPromise();

      // Startafter will fetch the next six clips after the Clip which snapshot is passed
      query = query.startAfter(lastDoc);
    }

    // To initiate our query to Firebase Get function return a Promise which in turn resolves to an Array of Firebase Documents
    const snapshot = await query.get();
    console.log(snapshot);

    // We dont want meta data we will only push docs from snapshot array
    snapshot.forEach((doc) => {
      this.pageClips.push({
        docID: doc.id,
        ...doc.data(),
      });
    });

    // When a request is Fulfilled
    this.pendingReq = false;
  }

  // Load the clip before loading CLip Component
  resolve(
    // ActivatedRouteSnapshot == ActivatedRoute gives access to Current route parameters
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): IClip | Observable<IClip | null> | Promise<IClip | null> | null {
    // Will Query FB using the ID of the clip in Route to Clip page
    return this.clipsCollection.doc(route.params.id).get().pipe(
      map(snapshot => {
        // Extracting only Data from Docuent Snapshot since we are only interested in that
        const data = snapshot.data();

        // If Video isn't Found We will redirect User to Home or 404
        if(!data) {
          this.router.navigate(['/'])
          return null;
        }

        // If Found then we will return Data from Document Snapshot
        return data;
      })
    )
  }
}
