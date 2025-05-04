import { Component } from '@angular/core';
import { loadTable, getNewName, setNewName } from '../Helper/User-pfp';
import { Router } from '@angular/router';
import { gotoPage, logOut } from '../Helper/Helpers';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-profile-ac',
  imports: [FormsModule],
  templateUrl: './user-profile-ac.component.html',
  styleUrl: './user-profile-ac.component.css'
})
export class UserProfileACComponent {

  constructor(private router: Router){}

  NameInput: string = '';

  Username: string = '';
  async ngOnInit(): Promise<void> {
    this.NameInput = await loadTable();
    this.Username = this.NameInput;
  }

  navtoPage(): void {
    gotoPage(this.router, '/contest-page');
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
