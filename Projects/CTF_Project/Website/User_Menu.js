/*
	Alex Miller
	Jordan Latimer

	Client side js for the menu for the User just before entering a contest
*/

// insert all the contests into the two tables 
async function InsertIntoTable(list) {
	// Past Contest Table
	const PCT = document.querySelector('#Past_Contests tbody');
	PCT.innerHTML = '';

	// Active Contest Table
	const ACT = document.querySelector('#Current_Contest tbody');
	ACT.innerHTML = '';

	// list of flags
	const res2 = await fetch('/getAllFlags');
	const flaglist = await res2.json();

	const email = getEmail();
	const res3 = await fetch('/getActiveContest', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({email})
	})
	let activeContest = await res3.json().catch(() => null);
	if(activeContest && activeContest.error === 'NO CONTEST FOUND') activeContest = null;
	list.forEach(contest => {
		const row = document.createElement('tr');
		const name = document.createElement('td');
		const flags = document.createElement('td');
		const leader = document.createElement('td');

		name.textContent = contest.Name;
		
		// get the amount of flags in the table
		let i = 0;
		flaglist.forEach(flag => {
			if (flag.ContestID === contest.ContestID) i++;
		});
		flags.textContent = i;

		// get the button for the leaderboard
		const leaderbutton = document.createElement('button');
		leaderbutton.textContent = 'view';
		leaderbutton.addEventListener('click', function() {
			Popup('leaderboard.html' ,getEmail(), 'ContestName=' + contest.Name);
		});
		leader.appendChild(leaderbutton);

		row.appendChild(name);
		row.appendChild(flags);

		if (contest.IsActive === 1) {
			const button = document.createElement('td');
			const JoinButton = document.createElement('button');
			JoinButton.textContent = 'Join';
			JoinButton.addEventListener('click', function() {
				window.location.href = '/Contest_Page.html?email=' + email;
			});

			button.appendChild(JoinButton);
			row.appendChild(button);
			ACT.appendChild(row);
		}
		else {
			row.appendChild(leader);
			if(!activeContest){
				const pracButtCell = document.createElement('td');
				const pracButt = document.createElement('button');
				pracButt.textContent = 'Practice';
				pracButt.addEventListener('click', function() {
					console.log("contestID", contest.ContestID);
					window.location.href = '/Contest_Page.html?email=' + email + '&contestID=' + contest.ContestID + '&Prac';
				});
				pracButtCell.appendChild(pracButt);
				row.appendChild(pracButtCell);
			}
			PCT.appendChild(row);
		}
	});
	if(!activeContest){
		const pracRow = document.querySelector('#Past_Contests thead tr');
		const pracRowCell = document.createElement('th');
		pracRowCell.textContent = 'Practice';
		pracRow.appendChild(pracRowCell);
	}
}