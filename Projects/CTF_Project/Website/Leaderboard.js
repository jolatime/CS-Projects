/* 
    Alex Miller
    Jordan Latimer

    client js for leaderboard.html
*/

window.onload = function() {
    getContestName();
}

// get the contest name from URL
function getContestName() {
    const url = window.location.search;
    const params = new URLSearchParams(url);
    const name = params.get('ContestName');
    document.getElementById('ContestName').textContent = name;
    PopulateLeaderboard(name);
}

// populate the leaderboard with the contest name
async function PopulateLeaderboard(contestname) {
    
    // get the data from server for the users
    const data = { email: getEmail(), contest: contestname };
    const res = await fetch('/FillLeaderboard', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(data)
    })
    if (res.ok) {
        const ret = await res.json();
        const users = ret.users;
        const flags = ret.flags;
        const subs = ret.subs;
        const contestID = ret.contestID;

        // make all of users flag counts to 0 by default
        for (var i=0; i < users.length; i++) {
            users[i].Flags = 0;
        }

        // loop through each submission to add tally to users
        for (var i=0; i < subs.length; i++) {
            for (var j=0; j < flags.length; j++) {

                // if the submission matches the flag in the contest and is correct, get that user and increase flag count
                if (subs[i].FlagID === flags[j].FlagID && subs[i].IsCorrect === 1) {
                    const user = getUser(subs[i].UserID);
                    user.Flags += 1;
                }
            }
        }

        // sort all of the users
        for (var i=0; i < users.length-1; i++) {
            for (var j=i+1; j < users.length; j++) {
                if (users[i].Flags < users[j].Flags) {
                    let user = users[i];
                    users[i] = users[j];
                    users[j] = user;
                }
            }
        }

        // get all users into table
        const tbody = document.getElementById('LeaderTBody');
        for (var k=0; k < users.length; k++) {
            const row = document.createElement('tr');
            const rank = document.createElement('td');
            rank.textContent = k+1;
            const name = document.createElement('td');
            name.textContent = users[k].Name;
            const flags = document.createElement('td');
            flags.textContent = users[k].Flags;

            row.appendChild(rank);
            row.appendChild(name);
            row.appendChild(flags);
            tbody.appendChild(row);
        }


        // get the user with the specific ID
        function getUser(userID) {
            for (var i=0; i < users.length; i++) {
                if (users[i].UserID === userID) return users[i];
            }
        }
    }
}