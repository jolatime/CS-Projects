import { Router } from '@angular/router';
import { Contest } from '../models/contest.model';
import { Flag } from '../models/flag.model';
import { Renderer2, ElementRef } from '@angular/core';
import { getEmail, updateContainer, gotoPage } from './Helpers';
import { TerminalService } from './terminal.service';
import { SocketIOService } from '../notifications/socket-io.service';
import { Socket } from 'socket.io-client';
import { AddFlagComponent } from '../add-flag/add-flag.component';
import { Submission } from '../models/submission.model';
import { User } from '../models/user.model';

let subs: Submission[] = [];
let UserID: number = 0;

export async function loadPage(renderer: Renderer2, el: ElementRef, ts: any, prac: Boolean): Promise<void> {
    const taskbar: HTMLElement = document.getElementById('Taskbar')!;

	// basics for use in multiple methods
    const elements = {
        flagName: el.nativeElement.querySelector('#Flag_Name') as HTMLElement,
        desc: el.nativeElement.querySelector('#Desc') as HTMLElement,
        contName: el.nativeElement.querySelector('#ContHeader') as HTMLElement,
        contestName: el.nativeElement.querySelector('#ContName') as HTMLElement,
        contDesc: el.nativeElement.querySelector('#ContDesc') as HTMLElement,
        hintDesc: el.nativeElement.querySelector('#Hint_Desc') as HTMLElement,
        HintButts: el.nativeElement.querySelector('#Hint_Butts') as HTMLElement
    }
    await LoadContest(el, elements, ts, prac);
  }

// get the params to see if admin or not
export function getAdmin(): string | null {
    const url: string = window.location.search;
    const params = new URLSearchParams(url);
    return params.get('admin');
}

// get the user
async function getUser() {
	const data = { email: getEmail() };
	const res = await fetch('api/users/getUser', {
		method: 'POST',
		headers: {
			'Content-Type' : 'application/json'
		},
		body: JSON.stringify(data)
	});
	if (res.ok) {
		let user = await res.json();
		UserID = user.UserID;
	}
}
// load the current active contest
async function LoadContest(el: ElementRef, elements: any, ts: any, prac: Boolean) {
    const contestID = new URLSearchParams(window.location.search).get('contestID');
    let contest: Contest | undefined;
    if(prac === true){
		const selectedContestStr = sessionStorage.getItem('contestID');
		const selectedContest = selectedContestStr ? parseInt(selectedContestStr, 10) : null;
		console.log("Contest ID:", selectedContest);
        const data = { contestID: selectedContest};
        const res = await fetch('api/contests/getContestByID', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if(res.ok) {
            contest = await res.json();
            console.log("contest", contest);
        }
    }
    else { 
      const data = { email: getEmail() };
      const res = await fetch('api/contests/getActiveContest', {
        method: 'POST',
        headers: {
          'Content-Type' : 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        contest = await res.json();
      }
    }

    const msg = el.nativeElement.querySelector('#DefaultMessage') as HTMLElement;      
    if (!contest) {
      alert('No Contest is Active');
      msg.classList.remove('hidden');
    }
    else {
      msg.classList.add('hidden');
      console.log('Contest:', contest);
      elements.contName.innerHTML = contest.Name + ' Contest';
      await LoadElements(contest, el, elements, ts);
    }
  }

// load all the dynamic elements
async function LoadElements(contest: Contest, el: ElementRef, elements: any, ts: any) {
	const data = { contest: contest.ContestID };
	const res = await fetch('api/flags/getAllFlagsFromContest', {
		method: 'POST',
		headers: { 
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});
	if(!res.ok){
		console.error('Error fetching flags for contest');
		return;
	}
	const flagdata: Flag[] = await res.json();
	console.log("Fetched Flags:", flagdata);
	const UL = el.nativeElement.querySelector('#FlagList') as HTMLElement;
    if(UL)
	    UL.innerHTML = '';
	if(flagdata.length === 0){
		console.warn("no flags found for contest");
		return;
	}
    if(elements.contName) elements.contName.style.display = 'none';
    if(elements.contDesc) elements.contDesc.style.display = 'none';

	const tmp = await getActiveFlag(getEmail(), contest.ContestID, el, elements);
	if(tmp.ActiveFlag === 'ubuntu'){
		elements.contName.innerHTML = contest.Name;
		elements.contDesc.innerHTML = contest.Description;
		elements.contName.style.display = 'block';
		elements.contDesc.style.display = 'block';
	}

    const submitFlag = el.nativeElement.querySelector('#Submit_Flag_Stuff') as HTMLElement;
    const hintStuff = el.nativeElement.querySelector('#Hint_Stuff') as HTMLElement;
	// add the contest name to the list
	elements.flagName.textContent = '';
	elements.desc.textContent = '';
	if(elements.hintButts) elements.hintButts.innerHTML = '';
	if(submitFlag) submitFlag.classList.add('hidden');
    hintStuff.classList.add('hidden');

	getUser();
	await getSubs();
	flagdata.forEach(flag => {
		
		console.log(flag);
		const li = document.createElement('li');
		const a = document.createElement('a');
		a.textContent = flag.Name;
		li.onclick = () => setNewFlag(flag, el, elements, ts);

		// add to list
		CheckIfCorrect(li,flag);
		li.appendChild(a);
		UL.appendChild(li);
	});
}

// get all of the submissions
async function getSubs() {
	const res = await fetch('api/submissions/getSubs', {
		method: 'POST',
		headers: {
			'Content-Type' : 'application/json'
		}
	});
	if (res.ok) {
		subs = await res.json();
	}
}

// checks whether to add the correct class to the flag
async function CheckIfCorrect(li: HTMLLIElement, flag: Flag) {
	for (let i=0; i < subs.length; i++) {
		if (subs[i].FlagID === flag.FlagID) {
			if (subs[i].UserID == UserID && subs[i].IsCorrect == true) {
				li.classList.add('CorrectSub');
			}
		}
	}
}

// get the active flag of a user
async function getActiveFlag(email: string, contest: number, el: ElementRef, elements: any) {
	const data = { email: email };
	const res = await fetch('api/flags/getActiveFlag', {
		method: 'POST',
		headers: {
			'Content-Type' : 'application/json'
		},
		body: JSON.stringify(data)
	});
	if (res.ok) { // get the active flag onto html
		const ret = await res.json();

		// go through all the flags gotten and make sure it's the right one for this contest
		for (let i=0; i < ret.length; i++) {
			if (contest === ret[i].ContestID) setUpFlag(ret[i], el, elements);
		}
	}
	return { ActiveFlag: 'ubuntu' };
}
let currentFlagID: number | null = null;

// get the new flag the user clicked on
export async function setNewFlag(flag: Flag, el: ElementRef, elements: any, ts: any) {
	currentFlagID = flag.FlagID;
    console.log("The new flagID is", currentFlagID);
    const submitFlagButt = el.nativeElement.querySelector('#Submit_Flag_Stuff') as HTMLElement;
    const hintstuff = el.nativeElement.querySelector('#Hint_Stuff') as HTMLElement;
    const resultelement = el.nativeElement.querySelector('#Submission_Result') as HTMLElement;
    const input = el.nativeElement.querySelector('#Submit_Flag_Stuff input[type="text"]') as HTMLInputElement;

	if(submitFlagButt) {
		submitFlagButt.classList.remove('hidden');

		// clear the result and the input box
        if(resultelement){
            resultelement.textContent = '';
		    resultelement.classList.remove('Incorrect', 'Correct');
        }
		
        if(input){
            input.value = '';
		    input.placeholder = 'NMUCTF${FLAG}'; 
        }
	}
    if(hintstuff) hintstuff.classList.remove('hidden');

	const email = getEmail();
	const data = { FlagImage: flag.Image, email: email };
	const res = await fetch('api/flags/setNewActiveFlag', {
		method: 'POST',
		headers: {
			'Content-Type' : 'application/json'
		},
		body: JSON.stringify(data)
	});
	if (res.ok) { // get the flag details onto html
		const ret = await res.json();
		setUpFlag(flag, el, elements);
		await updateContainer(email);
		console.log('Setting new Flag');
		ts.ClearAndSetTerminal(); // clears the terminal and replaces with the new one for the specific flag
	}
	else
		console.error('Failed to set new flag.');
}

// set the HTML to the correct flag
function setUpFlag(flag: Flag, el: ElementRef, elements: any) {

	// set up the basics
	elements.flagName.innerHTML = flag.Name;
	elements.desc.innerHTML = flag.Description;
	if(elements.HintButts) elements.HintButts.innerHTML = '';
	if(elements.hintDesc) elements.hintDesc.innerHTML = '';

	// set up the hints buttons
	if (flag.Hint1) {
		const hint1 = document.createElement('button');
		hint1.textContent = 'Hint 1';
		hint1.addEventListener('click', function() {
			elements.hintDesc.innerHTML = flag.Hint1;
		});
		elements.HintButts.appendChild(hint1);
	}
	if (flag.Hint2) {
		const hint2 = document.createElement('button');
		hint2.textContent = 'Hint 2';
		hint2.addEventListener('click', function() {
			elements.hintDesc.innerHTML = flag.Hint2;
		});
		elements.HintButts.appendChild(hint2);
	}
	if (flag.Hint3) {
		const hint3 = document.createElement('button');
		hint3.textContent = 'Hint 3';
		hint3.addEventListener('click', function() {
			elements.hintDesc.innerHTML = flag.Hint3;
		});
		elements.HintButts.appendChild(hint3);
	}

	// if theres at least one hint have a placeholder for user
	if (flag.Hint1 || flag.Hint2 || flag.Hint3) {
		elements.hintDesc.textContent = 'click to see a Hint';
	}
	else {
		elements.hintDesc.textContent = 'there are no Hints at all good luck :('
	}
}

/*async function stopContainer(){
	if(container){
		await container.kill();
		await container.remove({force:true});
	}
}*/

function getCurrentFlagID(){
	return currentFlagID;
}

export function handleSubmission(el: ElementRef, socket: SocketIOService){
	const url = window.location.href;
	if(url.includes("Prac")){
		checkSubmission(true, el, socket);
	}
	else{
		checkSubmission(false, el, socket);
	}
}

async function checkSubmission(isPractice: boolean, el: ElementRef, socket: SocketIOService){
	const submittedFlag = el.nativeElement.querySelector('#Submit_Flag input[type="text"]').value.trim();
	const email = getEmail();
	const flagID = getCurrentFlagID();
	console.log("FLAG ID IS", flagID);
    const flagName = el.nativeElement.querySelector('#Flag_Name').textContent;
    const resultelement = el.nativeElement.querySelector('#Submission_Result');
	if(!submittedFlag){
		resultelement.textContent = "Please enter a flag.";
		return;
	}
	let res, result;
	if(!isPractice){
		res = await fetch('api/submissions/checkFlagSubmission', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json'},
			body: JSON.stringify({ email, flagID, submittedFlag })
		});
	}
	else{
		res = await fetch('api/submissions/checkPracSubmission', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json'},
			body: JSON.stringify({ email, flagID, submittedFlag })
		});
	}
	result = await res.json();
	
	// correct flag
	if(result.correct){
		resultelement.classList.add('Correct');
		resultelement.classList.remove('Incorrect');
		resultelement.textContent = 'Correct! :)';

		// change flag li to green
		const flaglist = document.getElementById('FlagList') as HTMLUListElement;
		for (let i=0; i < flaglist.children.length; i++) {
			
			// grab the li and add a classlist of correct
			let flag = flaglist.childNodes[i] as HTMLLIElement;
			if (flag.firstChild?.textContent === flagName) {
				flag.classList.add('CorrectSub');
				console.log('added correct color');
				console.log(flag.firstChild);
			}
		}

		console.log("SENDING NOTIF", email, flagName);
		/*socket.emit('submission-notification', {
			email, flagName, time: new Date().toISOString()
		});*/
	}

	// incorrect flag
	else{
		resultelement.classList.add('Incorrect');
		resultelement.classList.remove('Correct');
		resultelement.textContent = 'Incorrect! :(';
	}
}
