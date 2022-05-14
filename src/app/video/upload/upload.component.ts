import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { last, switchMap } from 'rxjs/operators';

// Linking Uploaded File to User Account
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
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

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipsService: ClipService,
    private router: Router
  ) {
    this.auth.user.subscribe((user) => (this.user = user));
  }

  ngOnDestroy(): void {
    // Cancelling User Upload If Component is Destroyed

    this.task?.cancel();
  }

  storeFile($event: Event) {
    console.log($event);
    this.isDragOver = false;

    this.file = ($event as DragEvent).dataTransfer
      ? ($event as DragEvent).dataTransfer?.files.item(0) ?? null
      : ($event.target as HTMLInputElement).files?.item(0) ?? null;

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
    console.log(this.file);
  }

  uploadFile() {
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

    this.task = this.storage.upload(clipPath, this.file);

    // creating Reference in Database / Storage

    const clipRef = this.storage.ref(clipPath);

    // Ubed's Method
    // this.percentage = task.percentageChanges();

    // OG METHOD

    this.task.percentageChanges().subscribe((progress) => {
      this.percentage = (progress as number) / 100;
    });

    // task.snapshotChanges().pipe(last()).subscribe(console.log);
    this.task
      .snapshotChanges()
      .pipe(
        last(),
        switchMap(() => clipRef.getDownloadURL())
      )
      .subscribe({
        next: async (url) => {
          // Linking Auth User with Uploaded File
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            fileName: `${clipFileName}.mp4`,
            url,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          };

          const clipDocRef = await this.clipsService.createClip(clip);
          console.log(clip);

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
