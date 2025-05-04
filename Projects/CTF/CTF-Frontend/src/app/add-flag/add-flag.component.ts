import { Component } from '@angular/core';
import { gotoPage, getEmail } from '../Helper/Helpers';
import { Router } from '@angular/router';
import { ModifyContestService } from '../modify-contest/modify-contest.service';
import { Image } from '../models/image.model';
import { NgFor, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-flag',
  imports: [NgFor, CommonModule, FormsModule],
  templateUrl: './add-flag.component.html',
  styleUrl: './add-flag.component.css'
})
export class AddFlagComponent {

  images: Image[] = [];

  constructor(private router: Router, private modifyContestService: ModifyContestService){}

  async ngOnInit() {
    this.images = await this.modifyContestService.getImages(getEmail());
  }

  // add a flag to a contest
  async AddFlag(){
    // get contestId from URL
    const contestId = parseInt(sessionStorage.getItem('selectedContestID') || '', 10);

      // get all the values in the form
      const flagName = document.getElementById("Name") as HTMLInputElement;
      const description = document.getElementById("Description") as HTMLInputElement;
      let Hint1 = document.getElementById("Hint1") as HTMLInputElement;
      let Hint2 = document.getElementById("Hint2") as HTMLInputElement;
      let Hint3 = document.getElementById("Hint3") as HTMLInputElement;
      const image = document.getElementById('Images') as HTMLInputElement;
      const path = document.getElementById('Path') as HTMLInputElement;

      // required fields
      if(!flagName.value){
          alert("Enter a flag name.");
          return;
      }
      if(contestId === null || contestId === undefined){
          alert("Please select a contest first.");
          return;
      }

      // add the flag
      const data = {name: flagName.value, desc: description.value, contest: contestId, image: image.value, path: path.value, hint1: Hint1.value || '', hint2: Hint2.value || '', hint3: Hint3.value || ''};
      try{
          const response = await fetch('api/flags/AddFlag', {
              method: 'POST',
              headers: {'Content-Type': 'application/json',},
              body: JSON.stringify(data)
          });
          if(response.ok){
            console.log("Flag added");
            // reload the parent window when this window closes
            window.opener.postMessage({ type: 'FLAG_ADDED', contestId: contestId }, window.origin);
            window.close();
          }
          else{
              alert("Failed to add flag.");
          }
      } catch(error){
          console.error("Error adding flag:", error);
          alert("An error occurred while adding flag.");
      }
  }
    
  async getImages(): Promise<void>{
    const email = this.getEmail();
    try{
      const imageData = await this.modifyContestService.getImages(email);
      this.images = imageData || [];
    }catch(error){
      console.error('Error loading images');
    }
  }

  navtoPageCI(){
    gotoPage(this.router, '/create-image');
  }

  getEmail(): string{
    return getEmail();
  }
}
