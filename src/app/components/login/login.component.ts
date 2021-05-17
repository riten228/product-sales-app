import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AuthService } from 'src/app/shared/services';
import { MessageService, Message } from 'primeng/api';
import { PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService]
})

export class LoginComponent implements OnInit {

  loginForm: FormGroup = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  loading = false;
  submitted = false;
  returnUrl: string = '';
  error = '';
  messages: Message[];
  messageInfo: Message[];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthService,
    private messageService: MessageService,
    private primengConfig: PrimeNGConfig
  ) {
    // redirect to home if already logged in
    if (this.authenticationService.currentUserValue && this.authenticationService.currentUserValue.userId !== 0) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.messageInfo = [
      { severity: 'info', summary: 'Info', detail: 'Please use this for validation -> UserName : testUser | Password: test1234' }
    ];
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.primengConfig.ripple = true;
  }

  get formData() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      this.messages = [{ severity: 'error', summary: 'Username OR Password is required!' }];
      return;
    }

    this.loading = true;
    this.authenticationService.login(this.formData.username.value, this.formData.password.value)
      .pipe(first())
      .subscribe(
        data => {
          this.router.navigate([this.returnUrl]);
        },
        error => {
          this.messages = [{ severity: 'error', summary: 'Username OR Password is incorrect. Please try again!' }];
          this.error = error;
          this.loading = false;
        });
  }
}
