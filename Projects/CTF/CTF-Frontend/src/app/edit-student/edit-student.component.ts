import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-edit-student',
  imports: [FormsModule, NgIf],
  templateUrl: './edit-student.component.html',
  styleUrl: './edit-student.component.css'
})
export class EditStudentComponent {
  emailinput: string | null = sessionStorage.getItem('selectedUser');;
  showPass: boolean = false;
  newPassword: string = '';
  confirmPassword: string = '';
  // edit the password of a student
  async EditPass() {
    const ps1 = this.newPassword;
    const ps2 = this.confirmPassword
    // password protection
    if (ps1.length < 10 || ps1 == "") {
        alert("password must be at least 10 characters");
        return;
    }

    if (ps1 == ps2) { // if both passwords are equal, continue
        const data = { email: this.emailinput, password: ps1};
        const res = await fetch('api/users/UpdateStudent', {
            method: "POST",
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            console.log("Success: changing password");
            window.close();
        }
        else {
            console.log("ERROR: changing password");
        }
    }
    else {
        alert('Passwords do not match');
    }
  }

  ShowPassword(){
    this.showPass = !this.showPass;
  }
}
