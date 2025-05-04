import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const email = sessionStorage.getItem('email');
    if (!email) {
      this.router.navigate(['/unauthorized']);
      return false;
    }
    return true;
  }
}