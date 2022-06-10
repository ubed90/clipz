import { Pipe, PipeTransform } from '@angular/core';
import firebase from 'firebase/compat/app';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'fbTimestamp',
})
export class FbTimestampPipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}

  // Undefined is to make It working in Clip Component since ther clip varuiable is Optional
  transform(value: firebase.firestore.FieldValue | undefined) {
    // If value is empty return empty string
    if (!value) {
      return '';
    }

    // We converted Firebase Timestamp value to Javascript date using toDate()
    // We have to assert value as FB timestamp due to firebase custom type assertion recognize it as FieldValue Object
    const date = (value as firebase.firestore.Timestamp).toDate();

    return this.datePipe.transform(date, 'mediumDate');
  }
}
