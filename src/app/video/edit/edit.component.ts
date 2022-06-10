import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  // Getting the active clip from Clicked Editted Video
  @Input() activeCLip: IClip | null = null;

  // Refreshing the List of User Clips After Successfull Edit
  @Output() update = new EventEmitter();

  // FormControls and FormGroups for reactiveForms
  clipId = new FormControl('');

  title = new FormControl('', [Validators.required, Validators.minLength(3)]);

  editForm: FormGroup = new FormGroup({
    title: this.title,
    id: this.clipId,
  });

  // ALert Component
  showAlert: boolean = false;
  alertMsg: string = "Please Wait! You're Clip Is Being Updated...";
  alertColor: string = 'blue';

  // Disable Form During Submission
  inSubmission = false;

  constructor(private modal: ModalService, private clipService: ClipService) {}

  ngOnInit(): void {
    this.modal.register('editCLip');
  }

  ngOnDestroy(): void {
    this.modal.unregister('editCLip');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.activeCLip) {
      return;
    }

    this.clipId.setValue(this.activeCLip.docID);
    this.title.setValue(this.activeCLip.title);

    this.inSubmission = false;
    this.showAlert = false;
  }

  async submit() {
    if (!this.activeCLip) {
      return;
    }
    this.inSubmission = true;
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = "Please Wait! You're Clip Is Being Updated...";

    try {
      await this.clipService.updateClip(this.clipId.value, this.title.value);
    } catch (e) {
      this.inSubmission = false;
      this.alertColor = 'red';
      this.alertMsg = 'Oops! Something Went Wrong. Try Again later...';
      return;
    }

    // Emitting event to Parent with Updated title
    this.activeCLip.title = this.title.value;
    this.update.emit(this.activeCLip);

    this.inSubmission = false;
    this.alertColor = 'green';
    this.alertMsg = 'Voila! your Clip Has Been Updated...';
  }
}
