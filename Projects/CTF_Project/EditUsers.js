/*
    Alex Miller
    Jordan Latimer

    Editing users for Admin
*/

window.onload = function() {
    document.getElementById('Email').innerHTML = 'Email: ' + getEmail();
};

// show the password that is typed in
function ShowPassword() {
    let PS1 = document.getElementById('PS1');
    let PS2 = document.getElementById('PS2');

    if (PS1.type === 'password') {
        PS1.type = 'text';
        PS2.type = 'text';
    }
    else {
        PS1.type = 'password';
        PS2.type = 'password';
    }
}

// add a student to the database
async function AddStudent() {
    const name = document.getElementById("Name").value;
    const email = document.getElementById("EM").value;
    const ps1 = document.getElementById("PS1").value;
    const ps2 = document.getElementById("PS2").value;
    const Aemail = getEmail();

    // password protection
    if (ps1.length < 10 || ps1 == "") {
        alert("password must be at least 10 characters");
        return;
    }
    if (ps1 == ps2) { // passwords match
        const data = {name: name, email: email, Aemail: Aemail, password: ps1};
        const res = await fetch('/AddStudent', {
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

// edit the password of a student
async function EditPass() {

    const email = getEmail();

    const ps1 = document.getElementById('PS1').value;
    const ps2 = document.getElementById('PS2').value;

    // password protection
    if (ps1.length < 10 || ps1 == "") {
        alert("password must be at least 10 characters");
        return;
    }

    if (ps1 == ps2) { // if both passwords are equal, continue
        const data = { email: useremail, password: ps1};
        const res = await fetch('/UpdateStudent', {
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