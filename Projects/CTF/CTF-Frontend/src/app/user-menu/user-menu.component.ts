import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router'
import { Contest } from '../models/contest.model.js';
import { PopulateTable, InsertIntoTable, gotoPage, getContests } from '../Helper/Helpers.js';
@Component({
  selector: 'app-user-menu',
  imports: [],
  templateUrl: './user-menu.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrl: './user-menu.component.css'
})

export class UserMenuComponent implements OnInit{
  constructor(private router: Router){}

  async ngOnInit(): Promise<void> {
    let data: Contest[] = await getContests();
    InsertIntoTable(data, this.router);
  }

  navtoPage(): void {
    gotoPage(this.router, '/user-profile');
  }
}
