import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { last, switchMap } from 'rxjs/operators';
// Combine Latest to get Merged Upload Progress for Both Video and Screenshot
import { combineLatest, forkJoin } from 'rxjs';

// Linking Uploaded File to User Account
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnDestroy {
  // Variables for Drag / Drop / File / Form
  isDragOver = false;

  file: File | null = null;

  nextStep: boolean = false;

  // Form Variables

  title = new FormControl('', [Validators.required, Validators.minLength(3)]);

  uploadForm: FormGroup = new FormGroup({
    title: this.title,
  });

  // ALert Component
  showAlert: boolean = false;
  alertMsg: string = "Please Wait! You're Clip Is Being Uploaded...";
  alertColor: string = 'blue';

  // Disable Form During Submission
  inSubmission = false;

  // Percentage for Upload Progress
  // Ubed's method
  // percentage: any = 0;

  // OG METHOD
  percentage: number = 0;

  // Disable Percentage
  showPercentage: boolean = false;

  // Getting Auth User
  user: firebase.User | null = null;

  // Upload Task to cancel Upload Whenver User changes URL or navigates to another Page
  task?: AngularFireUploadTask;

  // Storing Generated Screenshots
  screenShots: string[] = [];

  // Selected SreenSHot
  selectedScreenshot: string = '';

  // Same as Video Upload Task
  screenshotTask?: AngularFireUploadTask;

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipsService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService
  ) {
    this.auth.user.subscribe((user) => (this.user = user));
    this.ffmpegService.init();
  }

  ngOnDestroy(): void {
    // Cancelling User Upload If Component is Destroyed

    this.task?.cancel();
  }

  // Generating SS via FFMPEG Web Assembly required to store the file in memory until SS is generated
  // So we need to apply async await to wait untill SS is generated in the memory

  async storeFile($event: Event) {
    // To prevent Multiple Uploads Since SS Generation Takes time
    if (this.ffmpegService.isRunning) {
      return;
    }

    console.log($event);
    this.isDragOver = false;

    this.file = ($event as DragEvent).dataTransfer
      ? ($event as DragEvent).dataTransfer?.files.item(0) ?? null
      : ($event.target as HTMLInputElement).files?.item(0) ?? null;

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    // retreiving the SS since the Service method returns a Promise
    this.screenShots = await this.ffmpegService.getScreenshots(this.file);

    // Make Sure A screesnhot is always selected... Selecting First Child after getting array of screenshots
    this.selectedScreenshot = this.screenShots[0];

    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
    console.log(this.file);
  }

  async uploadFile() {
    // First Disable The Form
    this.uploadForm.disable();
    // console.log('File Uploaded');

    this.showAlert = true;
    this.alertMsg = "Please Wait! You're Clip Is Being Uploaded...";
    this.alertColor = 'blue';
    this.inSubmission = true;
    this.showPercentage = true;

    const clipFileName = uuid();

    const clipPath = `clips/${clipFileName}.mp4`;

    // Getting the Blob from URl of the Screenshot Selected.. Coz Firebase accepts Blob Storage
    const screenshotBlob = await this.ffmpegService.blobFromUrl(
      this.selectedScreenshot
    );

    // Making one Collection for Screenshots
    const screenshotPath = `screenshots/${clipFileName}.png`;

    // Uploading the Video
    this.task = this.storage.upload(clipPath, this.file);

    // creating Reference in Database / Storage

    const clipRef = this.storage.ref(clipPath);

    // Ubed's Method
    // this.percentage = task.percentageChanges();

    // Uploading Screenshot
    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob);

    // creating Reference in Database / Storage

    const screenshotRef = this.storage.ref(screenshotPath);

    // OG METHOD

    // Prevoius Only for Video Upload
    // this.task.percentageChanges().subscribe((progress) => {
    //   this.percentage = (progress as number) / 100;
    // });

    // For Both Video and Screenshot
    combineLatest([
      this.task.percentageChanges(),
      this.screenshotTask.percentageChanges(),
    ]).subscribe((progress) => {
      const [clipProgress, screenshotProgress] = progress;

      if (!clipProgress || !screenshotProgress) {
        return;
      }

      const total = clipProgress + screenshotProgress;

      this.percentage = (total as number) / 200;
    });

    // task.snapshotChanges().pipe(last()).subscribe(console.log);
    // Prevoius Method Which grabbed the URL after Video has been uploaded Successfully and then made one document in the storage
    // this.task
    //   .snapshotChanges()
    //   .pipe(
    //     last(),
    //     switchMap(() => clipRef.getDownloadURL())
    //   )
    //   .subscribe({
    //     next: async (url) => {
    //       // Linking Auth User with Uploaded File
    //       const clip = {
    //         uid: this.user?.uid as string,
    //         displayName: this.user?.displayName as string,
    //         title: this.title.value,
    //         fileName: `${clipFileName}.mp4`,
    //         url,
    //         timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    //       };

    //       const clipDocRef = await this.clipsService.createClip(clip);
    //       console.log(clip);
    //       console.log(clipDocRef);

    //       this.alertColor = 'green';
    //       this.alertMsg =
    //         "Success! You're Clip Is Now Ready To Be Shared with the World...";
    //       this.showPercentage = false;

    //       setTimeout(() => {
    //         this.router.navigate(['clip', clipDocRef.id]);
    //       }, 1000);
    //     },
    //     error: (error) => {
    //       // Enable The Form
    //       this.uploadForm.enable();

    //       this.alertColor = 'red';
    //       this.alertMsg = 'Upload Failed! Please Try Again Later...';
    //       this.inSubmission = false;
    //       this.showPercentage = false;
    //       console.error(error);
    //     },
    //   });

    // Latest One to Combine Both Video and Screenshot SnapshotChanges Observable to get Both Data and simultanoeus Document Creation
    forkJoin([
      this.task.snapshotChanges(),
      this.screenshotTask.snapshotChanges(),
    ])
      .pipe(
        // Since Forkjoin Operator Only pushes the completed value Last operator is not required
        // last(),

        // Using the Forkjoin operator here also to get Values emiited from both ClipRef and ScreenshotRef
        switchMap(() =>
          forkJoin([clipRef.getDownloadURL(), screenshotRef.getDownloadURL()])
        )
      )
      .subscribe({
        // Update the argumen to URL's Since we are receiving two Uploaded images
        next: async (urls) => {
          const [clipURl, screenshotURL] = urls;

          // Linking Auth User with Uploaded File
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            fileName: `${clipFileName}.mp4`,
            url: clipURl,
            screenshotURL,
            screenshotFileName: `${clipFileName}.png`,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          };

          const clipDocRef = await this.clipsService.createClip(clip);
          console.log(clip);
          console.log(clipDocRef);

          this.alertColor = 'green';
          this.alertMsg =
            "Success! You're Clip Is Now Ready To Be Shared with the World...";
          this.showPercentage = false;

          setTimeout(() => {
            this.router.navigate(['clip', clipDocRef.id]);
          }, 1000);
        },
        error: (error) => {
          // Enable The Form
          this.uploadForm.enable();

          this.alertColor = 'red';
          this.alertMsg = 'Upload Failed! Please Try Again Later...';
          this.inSubmission = false;
          this.showPercentage = false;
          console.error(error);
        },
      });
  }
}
