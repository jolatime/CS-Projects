/*
    Jordan Latimer
    Alex Miller

    Client side code for Profile Page on Admin side
*/

// populate the table where the users are
window.onload = function() {
    getContests();
    populateTable();
}

// fill in the table in the profile page for Admin
async function populateTable() {
    const email = getEmail();
    const data = { email: email };
    const res = await fetch('/getAllUsers', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (res.ok) {
        const ret = await res.json();
        const TB = document.querySelector('#Students tbody');
        TB.innerHTML = "";

        // insert student data into table on webpage
        ret.forEach(user => {

            // simple content for a user
            const row = document.createElement('tr');
            const name = document.createElement('td');
            name.textContent = user.Name;
            const flags = document.createElement('td');
            flags.textContent = user.Flags;
            const email = document.createElement('td');
            email.textContent = user.Email;

            // button for editing password
            const Button = document.createElement('td');
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.setAttribute('id', 'EditStudent');
            editButton.setAttribute('data-email', user.Email);
            editButton.addEventListener('click', function() {
                const email = this.getAttribute('data-email');
                Popup("Change_Password.html",email);
            });

            // button for deleting user
            const Button2 = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.setAttribute('data-email', user.Email);
            deleteButton.setAttribute('id', 'DeleteStudent');
            deleteButton.addEventListener('click', function() {
                const email = this.getAttribute('data-email');
                OpenDialogBox(this);
            });

            // attach all the html elements together in the table
            Button2.appendChild(deleteButton);
            Button.appendChild(editButton);
            row.appendChild(name);
            row.appendChild(flags);
            row.appendChild(email);
            row.appendChild(Button);
            row.appendChild(Button2);

            TB.appendChild(row);
        });
    }
    else console.error('ERROR GETTING USERS');
}

// get all of the contests and add them as options
async function getContests() {
    const data = { email: getEmail() };
    const res = await fetch('/getContests', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (res.ok) {
        const ret = await res.json();
        
        // put the options in
        const dropdown = document.getElementById('DropDown');
        for (var i=0; i < ret.length; i++) {
            const contest = document.createElement('option');
            contest.innerHTML = ret[i].Name;
            dropdown.appendChild(contest);
        }
    }
}

// get the data for the flags table and create it
async function PopulateFlagsTable() {
    
    const contest = document.getElementById('DropDown').value;
    if (contest === 'Select a Contest') {
        alert('Must select a contest');
        return;
    }

    // get the contest with the admin email
    const data = { email: getEmail(), contest: contest };
    const res = await fetch('/getContestFlagsSubs', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (res.ok) {
        const ret = await res.json();
        const flags = ret.flags;
        const subs = ret.subs;

        let table = document.getElementById('FlagTBody');
        table.innerHTML = '';

        // create the table row for each flag 
        for (var i=0; i < flags.length; i++) {
            let row = document.createElement('tr');
            let name = document.createElement('td');
            name.textContent = flags[i].Name;
            
            // go through each sub and get the totals for this flag
            let attemptAmount = 0;
            let completionAmount = 0;
            for (var j=0; j < subs.length; j++) {
                if (subs[j].FlagID === flags[i].FlagID) {
                    attemptAmount += subs[j].Attempts;
                    completionAmount += subs[j].IsCorrect;
                }
            }

            // create the other table elements
            let attempts = document.createElement('td');
            attempts.textContent = attemptAmount;
            let completions = document.createElement('td');
            completions.textContent = completionAmount;

            // get the ratio of the attempts and completions
            let ratio = document.createElement('td');
            let percent = (completionAmount / attemptAmount) * 100;
            percent = percent.toFixed(2); // round to 2 decimal places
            ratio.textContent = percent + '%';

            // style ratio based on good or bad
            if (percent >= 80) ratio.style.color = 'lawngreen';
            else if (percent < 80 && percent >= 60) ratio.style.color = 'orange';
            else ratio.style.color = 'red';

            // add everything to the table
            row.appendChild(name);
            row.appendChild(attempts);
            row.appendChild(completions);
            row.appendChild(ratio);

            table.appendChild(row);
        }
    }
}

// open the dialog box for deleting a student with the right email
function OpenDialogBox(button) {
    document.getElementById('DialogBox').show();
    document.getElementById('emailDB').innerHTML = button.getAttribute('data-email');
}

// sort the table in the admin side
function SortTable() {
    var options = document.getElementById('Options').value;
    var name = document.getElementById('StudentName').value;

    var table = document.getElementById('TBody');
    var rows = table.rows;

    if (rows.length == 1) return; // if there is only one row in the table, no need to sort

    if ((options == "Name (A->Z)" || options == "Name (Z->A)") && name == "") { // sort by name
        MoveRows(table,options,0);
    }
    else if (options == "Flags (H->L)" || options == "Flags (L->H)") { // sort by flags
        MoveRows(table,options,1);
    }
    else if ((options == "Name (A->Z)" || options == "Name (Z->A)") && name != "") { // grab the student that Admin wants and put them on the top of the table
        for (var i=0; i < rows.length; i++) {
            var y = rows[i].getElementsByTagName('td')[0];
            if (name.toLowerCase() == y.innerHTML.toLowerCase()) { // found the student
                for (var j=i; j > 0; j--) { // push the row up
                    rows[i].parentNode.insertBefore(rows[j],rows[j-1]);
                }
                return;
            }
        }
        // the student is not found in the table
        alert("Student is not in database");
        return;
    }
}

// move the rows in the admin table to sort the data
function MoveRows(table,options,index) {

    var swapping = true;
    while (swapping) { // while loop to go through data
        swapping = false;
        var rows = table.rows;
        for (var i=0; i < rows.length-1; i++) { // go through each row once
            shouldswap = false;
            var x = rows[i].getElementsByTagName('td')[index];
            var y = rows[i+1].getElementsByTagName('td')[index];

            // if swapping goes high to low
            if (options == "Flags (H->L)" || options == "Name (Z->A)") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    rows[i].parentNode.insertBefore(rows[i+1],rows[i]);
                    swapping = true;
                }
            }

            // if swapping goes low to high
            else {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    rows[i].parentNode.insertBefore(rows[i+1],rows[i]);
                    swapping = true;
                }
            }
        }
    }
}

// delete a student from the database
async function DeleteStudent() {
    const Email = document.querySelector('#DialogBox Strong').innerText; // get the students email
    if (!Email) { // if no email
        console.log("Email not found");
        return;
    }
    const data = {email: Email};
    const res = await fetch('/DeleteStudent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (res.ok) {
        console.log("Succes: deleting student");
        window.location.reload();
    }
    else {
        console.log("ERROR: deleting student");
    }
    document.getElementById('DialogBox').close();
};

// get the leaderboard popup
function getLeaderboard() {
    const contest = document.getElementById('DropDown').value;
    if (contest === 'Select a Contest') {
        alert('Must select a contest');
        return;
    }
    else Popup('leaderboard.html' ,getEmail(), 'ContestName=' + contest);
}