/*
    Jordan Latimer
    Alex Miller

    Helper functions used by a variety of javascript files
*/
import { Router } from '@angular/router';
import { Contest } from '../models/contest.model';
import { Flag } from '../models/flag.model';
import { Terminal } from 'xterm';
import { AttachAddon } from '@xterm/addon-attach';
import { PopulateUserTables } from './User-pfp';
let term: Terminal | undefined;
// get the email of the client
export function getEmail(): string{
	return sessionStorage.getItem('email') || '';
}

// got to a specific page
export function gotoPage(router: Router, page: string): void {
	router.navigate([page]);
}

export function logOut(router: Router){
  router.navigate(['']);
}

// popup window for a specific page with the email
export function Popup(site: string): void {

    const width = 500;
    const height = 500;

    // get the right placement and size for any screen
    const x = screenX + (window.screen.width / 2) - (width / 2);
    const y = screenY + (window.screen.height / 2) - (height / 2);
    // add the features and the email inside the URL and open the window
    const features = `width=${width},height=${height},left=${x},top=${y}`;   
	  window.open(site,'popup',features);
}

// get all the table contents and add them in the respective table
export async function PopulateTable(page: number, InsertIntoTable: (data: Contest[]) => void): Promise<void> {
	const data = { email: getEmail() };
	const res = await fetch('api/contests/getContests', {
		method: 'POST',
		headers: {
			'Content-Type' : 'application/json'
		},
		body: JSON.stringify(data)
	});
	if (res.ok) {
		const list = await res.json();
		if (page === 0) InsertIntoTable(list);
		else PopulateUserTables(list);
	}
}

export async function getContests(): Promise<Contest[]> {
  const data = { email: getEmail() };
	const res = await fetch('api/contests/getContests', {
		method: 'POST',
		headers: {
			'Content-Type' : 'application/json'
		},
		body: JSON.stringify(data)
	});
	if (res.ok) {
		const list: Contest[] = await res.json();
		return list;
	}
  else {
    console.error('Failed to fetch contests');
    return [];
  }
}

const flagItems = document.querySelectorAll('#Flag_Sidebar li');
flagItems.forEach(item => {
	item.addEventListener('click', function() {
		flagItems.forEach(f => f.classList.remove('selected-flag'));
		item.classList.add('selected-flag');
	})
});

export async function InsertIntoTable(data: Contest[], router: Router): Promise<void> {
    // Past Contest Table
    const PCT = document.querySelector('#Past_Contests tbody') as HTMLTableSectionElement | null;
    // Active Contest Table
    const ACT = document.querySelector('#Current_Contest tbody') as HTMLTableSectionElement | null;
    if(!PCT || !ACT)
      return;
    PCT.innerHTML = '';
    ACT.innerHTML = '';
  
    // list of flags
    const res2 = await fetch('api/flags/getAllFlags');
    const flaglist: Flag[] = await res2.json();
  
    const email = getEmail();
    const res3 = await fetch('api/contests/getActiveContest', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email})
    })
    let activeContest = await res3.json().catch(() => null);
    console.log(activeContest);
    if(!activeContest || activeContest.message === 'No active contests found') activeContest = null;
    data.forEach((contest: Contest) => {
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
      flags.textContent = i.toString();
  
      // get the button for the leaderboard
      const leaderbutton = document.createElement('button');
      leaderbutton.textContent = 'view';
      leaderbutton.addEventListener('click', function() {
        Popup('/leaderboard');
       // Popup('leaderboard.html' ,getEmail(), 'ContestName=' + contest.Name); Uncomment when we finish leaderboard implementation
      });
      leader.appendChild(leaderbutton);
  
      row.appendChild(name);
      row.appendChild(flags);
  
      if (contest.IsActive === 1) {
        const button = document.createElement('td');
        const JoinButton = document.createElement('button');
        JoinButton.textContent = 'Join';
        JoinButton.addEventListener('click', function() {
          sessionStorage.setItem('Prac', 'false');
          router.navigate(['/contest-page']);
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
            sessionStorage.setItem('Prac', 'true');
            sessionStorage.setItem('contestID', contest.ContestID.toString());
            router.navigate(['/contest-page']);
          });
          pracButtCell.appendChild(pracButt);
          row.appendChild(pracButtCell);
        }
        PCT.appendChild(row);
      }
    });
    if(!activeContest){
      const pracRow = document.querySelector('#Past_Contests thead tr');
      if(pracRow){
        const pracRowCell = document.createElement('th');
        pracRowCell.textContent = 'Practice';
        pracRow.appendChild(pracRowCell);
      }
    }
  }

// update the container
export async function updateContainer(email: string){
	const res = await fetch(`api/updateContainer/${email}`, { method: 'POST'});

	if(res.ok){
		console.log('Container updated successfully');
	}
		
	else
		console.log('Failed to update container');
}

// reattach the terminal web socket
export async function reattachTerminal(term: Terminal){
	console.log('reattaching termnial');

	if(term) {
    term.dispose();
  }
	term = new Terminal();
	const container = document.getElementById('Linux_Shell');
	if(container && term) {
		term.open(container);
	}
	const socket = new WebSocket('/ws');
	socket.onopen = () => {
		socket.send(JSON.stringify(getEmail()));
		console.log('Websocket opened');
	}
	const attachAddon = new AttachAddon(socket);
	term.loadAddon(attachAddon);
	term.focus();
	socket.onclose = () => {
		console.log("socket closed");
	}
}