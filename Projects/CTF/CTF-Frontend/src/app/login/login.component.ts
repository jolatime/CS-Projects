import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, NgIf],
  templateUrl: './login.component.html',
  
  styleUrls: ['./login.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class LoginComponent {
  email: string = '';
  password: string = '';
  showPass: boolean = false;
  constructor(private router: Router) {}
  async SendCreds() {
    const data = { email: this.email, password: this.password };
    const res = await fetch('api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
    if (res.ok) { // okay response from server
      const RB = await res.json();
      if (RB && RB.redirectTo) { // redirect client to new webpage
        sessionStorage.setItem('email', RB.email);
        sessionStorage.setItem('role', RB.redirectTo === '/admin-contest' ? 'admin' : 'user');
        this.router.navigate([RB.redirectTo]);
      }
      else { // error handling
        console.error("redirect URL issue");
      }
    }
    else { // what user entered doesnt match up to db
      alert("Invalid Credentials");
    }
  }

  showPassword() {
    this.showPass = !this.showPass;
  }
}