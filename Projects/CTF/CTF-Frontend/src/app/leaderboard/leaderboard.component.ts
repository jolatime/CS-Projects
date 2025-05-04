/*
  Alex Miller
  Jordan Latimer

  Leaderboard Component 
*/

import { Component } from '@angular/core';
import { User } from '../models/user.model';
import { Contest } from '../models/contest.model';
import { Flag } from '../models/flag.model';
import { getEmail } from '../Helper/Helpers';
import { AdminProfileService } from '../admin-profile/admin-profile.service';
import { CommonModule } from '@angular/common';
import { NgFor } from '@angular/common';
import { Submission } from '../models/submission.model';

@Component({
  selector: 'app-leaderboard',
  imports: [NgFor, CommonModule],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent {
  users: User[] = []; // array of all usrs
  contest: string | null = ""; // contest name
  contestObj : Contest | null = null;
  contestID : number | undefined = 0; // contest ID
  subs: Submission[] = []; // all submissions
  flags: Flag[] = []; // all flags
  flagIds : number[] = []; // all flags FlagIDs

  constructor(private adminProfileService: AdminProfileService){}

  // on initialize
  ngOnInit() {
    this.PopulateTable();
    this.contest = sessionStorage.getItem('ContestString');
  }

  // get the user data and sort it for table
  async PopulateTable() {

    // get the admin from the user
    let AdminEmail: string = '';
    const data = { email: getEmail() };
    const res = await fetch('api/contests/getAdminEmail', {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const ret = await res.json();
      AdminEmail = ret;
    }



    // get all the users, flags, and submissions
    this.users = await this.adminProfileService.getAllUsers(AdminEmail);
    let result = await this.adminProfileService.getContestFlagsSubs(AdminEmail, this.contest);
    this.subs = result.subs;
    this.flags = result.flags;

    // get the contest and contestID
    result = await this.adminProfileService.getContests(AdminEmail);
    this.contestObj = result.filter((item : Contest) => item.Name === this.contest)[0];
    this.contestID = this.contestObj?.ContestID;

    // get all the flags of the same contest ID that the Admin selected
    this.flags = this.flags.filter((flag : Flag) => flag.ContestID === this.contestID);
    for (let i=0; i < this.flags.length; i++) {
      this.flagIds.push(this.flags[i].FlagID);
    }
    
    // change the subs to just be submissions for the flags of this contest
    this.subs = this.subs.filter((sub) => this.flagIds.includes(sub.FlagID));

    // loop thorugh the users and submissions to get the correct amount of flags for this contest
    for (let i=0; i < this.users.length; i++) {
      let user = this.users[i];
      this.users[i].Flags = 0;
      for (let j=0; j < this.subs.length; j++) {
        let sub = this.subs[j];
        if (user.UserID == sub.UserID && sub.IsCorrect == true) {
          this.users[i].Flags++;
        }
      }
    }
    this.users = this.users.sort((a,b) => b.Flags - a.Flags); // sort the users
  }


  // increment rank and insert into table
  getRank(index: number): number {
    return index++;
  }
}
