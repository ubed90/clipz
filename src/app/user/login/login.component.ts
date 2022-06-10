import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
// import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  credentials = {
    email: '',
    password: '',
  };

  showAlert: boolean = false;
  alertMsg: string = 'Please Wait! We Are Logging You In...';
  alertColor: string = 'blue';
  inSubmission = false;

  // constructor(private auth: AngularFireAuth) {}
  constructor(private auth: AuthService) {}

  ngOnInit(): void {}

  async login(form: NgForm): Promise<void> {
    // console.log(form.value);
    this.showAlert = true;
    this.alertMsg = 'Please Wait! We Are Logging You In...';
    this.alertColor = 'blue';
    this.inSubmission = false;

    try {
      // await this.auth.signInWithEmailAndPassword(
      //   form.value.email,
      //   form.value.password
      // );
      await this.auth.authenticateUser(form.value);
    } catch (e) {
      console.log(e);
      this.inSubmission = false;
      this.alertMsg = 'An UnExpected Error Occured. Please Try Again Later!';
      this.alertColor = 'red';
      return;
    }

    this.alertMsg = "Success. You're Now Logged In!";
    this.alertColor = 'green';
  }
}
