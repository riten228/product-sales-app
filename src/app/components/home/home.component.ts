import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { User } from 'src/app/shared/models';
import { PrimeNGConfig } from 'primeng/api';
import { UserService } from 'src/app/shared/services';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  loading = false;
  users: User[];

  constructor(
    private userService: UserService,
    private primengConfig: PrimeNGConfig)
    { }

  ngOnInit() {
    this.primengConfig.ripple = true;
    this.loading = true;
    this.userService.getAll().pipe(first()).subscribe(users => {
      this.loading = false;
      this.users = users;
    });
  }
}



