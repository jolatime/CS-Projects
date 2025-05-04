import { Component } from '@angular/core';
import { getEmail } from '../Helper/Helpers';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-student',
  imports: [NgIf, FormsModule],
  templateUrl: './add-student.component.html',
  styleUrl: './add-student.component.css'
})
export class AddStudentComponent {
  Uname: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  showPass: boolean = false;
  
  ShowPassword() {
    this.showPass = !this.showPass
}

// add a student to the database
  async AddStudent() {
    const Aemail = getEmail();

    // password protection
    if (this.password.length < 10 || this.password == "") {
        alert("password must be at least 10 characters");
        return;
    }
    else if(this.email == Aemail){
        alert("Funny guy, eh?");
        return;
    }
        
    if (this.password == this.confirmPassword) { // passwords match
        const data = {name: this.Uname, email: this.email, Aemail: Aemail, password: this.password};
        const res = await fetch('api/users/AddStudent', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            console.log("Success: adding student");
            window.opener.location.reload();
            window.close();
        }
        else {
            console.log("ERROR: adding student");
        }
    }
    else {
        alert("Passowrds do not match");
    }
}
}
