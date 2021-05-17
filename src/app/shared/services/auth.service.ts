import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { User } from 'src/app/shared/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private currentUserSubject: BehaviorSubject<User>;
    private loggedInUser: User;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient) {
      this.loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
        this.currentUserSubject = new BehaviorSubject<User>(this.loggedInUser);
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(username: string, password: string) {
        return this.http.post<any>(`${environment.apiUrl}/users/authenticate`, { username, password })
            .pipe(map(user => {
                // store user details and basic auth credentials in local storage to keep user logged in between page refreshes
                user.authdata = window.btoa(username + ':' + password);
                localStorage.setItem('loggedInUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
                return user;
            }));
    }

    logout() {
        // remove user from local storage to log user out - this functionality exists only if user is logged-in
        localStorage.removeItem('loggedInUser');
        this.currentUserSubject.next(null);
    }
}
