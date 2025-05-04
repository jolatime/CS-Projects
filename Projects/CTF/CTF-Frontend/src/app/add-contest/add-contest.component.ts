import { Component } from '@angular/core';
import { getEmail } from '../Helper/Helpers';

@Component({
  selector: 'app-add-contest',
  imports: [],
  templateUrl: './add-contest.component.html',
  styleUrl: './add-contest.component.css'
})
export class AddContestComponent {

  // add a contest to the database
  async AddContest() { 
	  const nameInput = document.getElementById("Name") as HTMLInputElement;
    const descInput = document.getElementById("Desc") as HTMLTextAreaElement;
    const name = nameInput.value;
    const desc = descInput.value;

    // character limit on contest name
    if (name.length > 20) {
      alert('Name of Contest must be 20 characters or below');
      return;
    }
    console.log("Name entered: ", name);
    console.log("Description entered: ", desc);
    const isActive = 0;
    console.log("EMAIL IS:", this.getEmail())
	  const data = {Name: name, IsActive: isActive, email: this.getEmail(), Desc: desc};
	  const res = await fetch('api/contests/AddContest', {
      method: 'POST',
      headers: {
			  'Content-Type' : 'application/json'
		  },
		  body: JSON.stringify(data)
	  });
	  if (res.ok) {
		  console.log("Success: adding contest");
		  window.opener.location.reload();
		  window.close();
	  }
	  else {
		  console.log("ERROR: adding contest");
	  }
  }

  getEmail(): string{
    return getEmail();
  }
}
