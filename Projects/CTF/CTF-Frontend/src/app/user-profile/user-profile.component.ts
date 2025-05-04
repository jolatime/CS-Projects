import { Component, OnInit } from '@angular/core';
import { gotoPage, logOut, getEmail } from '../Helper/Helpers';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { getNewName, setNewName, loadTable } from '../Helper/User-pfp';

@Component({
  selector: 'app-user-profile',
  imports: [FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {

  constructor(private router: Router){}

  NameInput: string = '';

  // get the users current username
  Username : string = '';

  async ngOnInit(): Promise<void> {
    this.NameInput = await loadTable();
    this.Username = this.NameInput;
  }

  navtoPage(): void {
    gotoPage(this.router, '/user-menu');
  }

  onGetNewName(): void{
    this.NameInput = getNewName();
  }

  onSetNewName(): void{
    setNewName(this.NameInput);
    this.Username = this.NameInput;
  }

  onLogout(): void{
    logOut(this.router);
  }
}
