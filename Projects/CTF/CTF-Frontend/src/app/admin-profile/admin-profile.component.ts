import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { gotoPage, logOut, getEmail, Popup } from '../Helper/Helpers';
import { AdminProfileService } from './admin-profile.service';
import { Flag } from '../models/flag.model';
import { User } from '../models/user.model';
import { Contest } from '../models/contest.model';
import { Submission } from '../models/submission.model';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-profile',
  imports: [NgFor, FormsModule, CommonModule],
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.css'
})
export class AdminProfileComponent implements OnInit{
  users: User[] = []
  displayedUsers: User[] = []
  contests: Contest[] = []
  subs: Submission[] = []
  flags: Flag[] = []
  selectedContest: string = '';
  constructor(private router: Router, private adminProfileService: AdminProfileService){}
  emailToDelete = '';
  searchText: string = '';

  ngOnInit(){
    this.getContests();
    this.populateTable();
  }

  async populateTable(){
    try{
      const email = this.getEmail();
      const users = await this.adminProfileService.getAllUsers(email);
      this.users = users;
    } catch(error) {
      console.error('Error populating user table', error);
    }
  }

  async populateFlagsTable(): Promise<void> {
    if(!this.selectedContest){
      alert('Must select a contest');
      return;
    }
    try{
      const email = getEmail();
      const result = await this.adminProfileService.getContestFlagsSubs(email, this.selectedContest);
      this.flags = result.flags;
      this.subs = result.subs;
      console.log("flags", this.flags);
      console.log("Subs", this.subs);
    }catch(error){
      console.error('Failed to populate flag table');
    }
  }

  getAttempts(flagId: number): number{
    return this.subs.filter(sub => sub.FlagID === flagId).reduce((acc, sub) => acc + sub.Attempts, 0);
  }

  getCompletions(flagId: number): number{
    return this.subs.filter(sub => sub.FlagID === flagId).reduce((acc, sub) => acc + (sub.IsCorrect ? 1 : 0), 0);
  }

  getRatio(flagId: number): number{
    const attempts = this.getAttempts(flagId);
    const completions = this.getCompletions(flagId);
    return attempts > 0 ? +(completions / attempts * 100).toFixed(2) : 0;
  }

  getRatioColor(flagId: number): string{
    const ratio = this.getRatio(flagId);
    if(ratio >= 80) return 'lawngreen';
    else if (ratio >= 60) return 'orange';
    return 'red';
  }

  openPasswordPopup(email: string){
    sessionStorage.setItem('selectedUser', email);
    Popup('/edit-student');
  }

  openAddUserPopup(){
    Popup('/add-student');
  }

  openLeaderboardPopup(){
    const contestElement = document.getElementById('DropDown') as HTMLSelectElement;
    const contest = contestElement.value;
    sessionStorage.setItem('ContestString', contest);
    if (!contest) {
      alert('Must select a contest');
      return;
    }
    else Popup('/leaderboard');
  }

  async getContests(){
    try {
      const email = this.getEmail();
      const contests = await this.adminProfileService.getContests(email);
      this.contests = contests;
    } catch(error){
      console.error("Error getting contests", error);
    }
  }

  openDeleteDialog(email: string): void {
    this.emailToDelete = email;
    const dialog = document.getElementById('DialogBox') as HTMLDialogElement
    if(dialog){
      dialog.showModal();
    }
  }

  async deleteUser(){
    try{
      if(!this.emailToDelete) return;
      await this.adminProfileService.deleteUser(this.emailToDelete);
      console.log("User deleted successfully");
      this.closeDialog();
      this.populateTable();
    } catch(error) {
      console.error("Error deleting user", error);
    }
  }

  closeDialog(): void {
    const dialog = document.getElementById('DialogBox') as HTMLDialogElement;
    if(dialog)
      dialog.close();
    this.emailToDelete = '';
  }

  // sort the students table
  sortTable(): void{

    // get the name and the option selected
    const name = this.searchText.trim().toLowerCase();
    let optionElement = document.getElementById('Options') as HTMLSelectElement;
    let option = optionElement.value;

    
    let sorted = this.users;

    // sort the students first
    if(option === 'Name (A->Z)'){
      sorted.sort((a, b) => a.Name.localeCompare(b.Name));
    }
    else if(option === 'Name (Z->A)'){
      sorted.sort((a, b) => b.Name.localeCompare(a.Name));
    }
    else if(option === 'Flags (H->L)'){
      sorted.sort((a, b) => b.Flags - a.Flags);
    }
    else if(option === 'Flags (L->H)'){
      sorted.sort((b, a) => b.Flags - a.Flags);
    }

    // search for specific student
    if (name !== '') {
      let targetIndex = sorted.findIndex(s => s.Name.toLowerCase() === name);

      // if no match of student then look for partial
      if (targetIndex === -1) {
        targetIndex = sorted.findIndex(s => s.Name.toLowerCase().includes(name));
      }

      // student in database
      if(targetIndex !== -1){
        const [student] = sorted.splice(targetIndex, 1);
        sorted.unshift(student);
      }
      else {
        alert('Student is not in the database');
      }
    }

    // display sorted array
    this.displayedUsers = sorted;
  }

  navtoPageAC(): void{
    gotoPage(this.router, '/admin-contest');
  }

  navtoPageMC(): void{
    gotoPage(this.router, '/modify-contest');
  }

  onLogout():  void{
    logOut(this.router);
  }

  getEmail(): string{
    return getEmail();
  }
}
