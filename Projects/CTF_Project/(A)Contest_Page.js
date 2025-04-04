/*
	Alex Miller
	Jordan Latimer

	Client side code for Contest Page on Admin side
*/

// on load, load the active contest
window.addEventListener('load', async function() {
	const isPractice = window.location.href.includes("Prac");
	const taskbar = document.getElementById('Taskbar');
	if (isPractice){
		taskbar.innerHTML = `<a href ="javascript:void(0);" onclick="confirmSelection(1)">Leave Practice</a>`;
	}
	if (getAdmin() === 'True') {
		taskbar.innerHTML = 
			`<a id="Current_Page" onclick="gotoPage('(A)Contest_Page.html?email=')"> Contest </a>
			<a href="javascript:void(0);" onclick="gotoPage('(A)Profile_Page.html?email=')"> Profile </a>`;
	}
	else {
		taskbar.innerHTML = 
			`<a id="Current_Page" onclick="gotoPage('Contest_Page.html?email=')"> Contest </a>
			<a href="javascript:void(0);" onclick="confirmSelection(2)"> Profile </a>`;
	}
	// basics for use in multiple methods
	flagname = document.getElementById('Flag_Name');
	description = document.getElementById('Desc');
	contName = document.getElementById('ContHeader');
	contestName = document.getElementById('ContName');
	contestDesc = document.getElementById('ContDesc');
	hintDesc = document.getElementById('Hint_Desc');
	HintButts = document.getElementById('Hint_Butts');
	LoadContest();
});

// get the params to see if admin or not
function getAdmin() {
	const url = window.location.search;
	const params = new URLSearchParams(url);
	return params.get('admin');
}

// load the current active contest
async function LoadContest() {
	const contestID = new URLSearchParams(window.location.search).get('contestID');
	console.log("Contest ID:", contestID);
	let contest = null;
	if(contestID){
		const data = { contestID: contestID};
		const res = await fetch('/getContestByID', {
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
		const res = await fetch('/getActiveContest', {
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
		
	if (!contest) {
		alert('No Contest is Active');
		document.getElementById('DefaultMessage').classList.remove('hidden');
	}
	else {
		document.getElementById('DefaultMessage').classList.add('hidden');
		console.log('Contest:', contest);
		contName.innerHTML = contest.Name + ' Contest';
		await LoadElements(contest);
	}
}

// load all the dynamic elements
async function LoadElements(contest) {
	const data = { contest: contest.ContestID };
	const res = await fetch('/getAllFlagsFromContest', {
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
	const flagdata = await res.json();
	console.log("Fetched Flags:", flagdata);
	const UL = document.querySelector('#FlagList');
	UL.innerHTML = '';

	if(flagdata.length === 0){
		console.warn("no flags found for contest");
		return;
	}

	document.getElementById('ContName').style.dispaly = 'none';
	document.getElementById('ContDesc').style.dispaly = 'none';

	const tmp = await getActiveFlag(getEmail(), contest.ContestID);
	if(tmp.ActiveFlag === 'ubuntu'){
		contestName.innerHTML = contest.Name;
		contestDesc.innerHTML = contest.Description;
		document.getElementById('ContName').style.display = 'block';
		document.getElementById('ContDesc').style.display = 'block';
	}

	// add the contest name to the list
	flagname.textContent = '';
	description.textContent = '';
	HintButts.innerHTML = '';

	// add each flag to the list
	document.getElementById('Flag_Name').textContent = '';
	document.getElementById('Desc').textContent = '';
	HintButts.innerHTML = '';
	const submitFlagButton = document.getElementById('Submit_Flag_Stuff');
	if(submitFlagButton) submitFlagButton.classList.add('hidden');
	
	document.getElementById('Hint_Stuff').classList.add('hidden');

	flagdata.forEach(flag => {
		
		console.log(flag);
		const li = document.createElement('li');
		const a = document.createElement('a');
		a.textContent = flag.Name;
		li.onclick = () => setNewFlag(flag);

		// add to list
		li.appendChild(a);
		UL.appendChild(li);
	});
}

// get the active flag of a user
async function getActiveFlag(email, contest) {
	const data = { email: email };
	const res = await fetch('/getActiveFlag', {
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
			if (contest === ret[i].ContestID) setUpFlag(ret[i]);
		}
	}
	return { ActiveFlag: 'ubuntu' };
}
let currentFlagID = null;

// get the new flag the user clicked on
async function setNewFlag(flag) {
	currentFlagID = flag.FlagID;
	document.getElementById('ContName').style.display = 'none';
	document.getElementById('ContDesc').style.display = 'none';
	document.getElementById('Flag_Name').textContent = flag.Name;
	document.getElementById('Desc').textContent = flag.Description;
	const submitFlagButton = document.getElementById('Submit_Flag_Stuff');
	if(submitFlagButton) {
		submitFlagButton.classList.remove('hidden');

		// clear the result and the input box
		const resultelement = document.getElementById('Submission_Result');
		resultelement.textContent = '';
		resultelement.classList.remove('Incorrect');
		resultelement.classList.remove('Correct');
		document.querySelector('#Submit_Flag_Stuff input[type="text"]').value = '';
		document.querySelector('#Submit_Flag_Stuff input[type="text"]').placeholder = 'NMUCTF${FLAG}';
	}
	document.getElementById('Hint_Stuff').classList.remove('hidden');

	const email = getEmail();
	const data = { FlagImage: flag.Image, email: email };
	const res = await fetch('/setNewActiveFlag', {
		method: 'POST',
		headers: {
			'Content-Type' : 'application/json'
		},
		body: JSON.stringify(data)
	});
	if (res.ok) { // get the flag details onto html
		const ret = await res.json();
		clearTerminal();
		setUpFlag(flag);
		await updateContainer(email);
		console.log('Setting new Flag');
		await reattachTerminal();
	}
	else
		console.error('Failed to set new flag.');
}

// set the HTML to the correct flag
function setUpFlag(flag) {

	// set up the basics
	flagname.innerHTML = flag.Name;
	description.innerHTML = flag.Description;
	HintButts.innerHTML = '';
	hintDesc.innerHTML = '';

	// set up the hints buttons
	if (flag.Hint1) {
		const hint1 = document.createElement('button');
		hint1.textContent = 'Hint 1';
		hint1.addEventListener('click', function() {
			hintDesc.innerHTML = flag.Hint1;
		});
		HintButts.appendChild(hint1);
	}
	if (flag.Hint2) {
		const hint2 = document.createElement('button');
		hint2.textContent = 'Hint 2';
		hint2.addEventListener('click', function() {
			hintDesc.innerHTML = flag.Hint2;
		});
		HintButts.appendChild(hint2);
	}
	if (flag.Hint3) {
		const hint3 = document.createElement('button');
		hint3.textContent = 'Hint 3';
		hint3.addEventListener('click', function() {
			hintDesc.innerHTML = flag.Hint3;
		});
		HintButts.appendChild(hint3);
	}

	// if theres at least one hint have a placeholder for user
	if (flag.Hin1 || flag.Hint2 || flag.Hint3) {
		hintDesc.textContent = 'click to see a Hint';
	}
	else {
		hintDesc.textContent = 'there are no Hints at all good luck :('
	}
}

async function stopContainer(){
	if(container){
		await container.kill();
		await container.remove({force:true});
	}
}

function confirmSelection(num){
	const confirmSelection_ = confirm("You will lose your current flag progress, are you sure?");
	if(confirmSelection_){
		const email = getEmail();
		if(num === 1)
			window.location.href = `User_Menu.html?email=${email}`;
		else
			window.location.href = `Profile_Page.html?email=${email}`;
	}
	else
		console.log("Profile navigation canceled");
}

function getCurrentFlagID(){
	return currentFlagID;
}

async function checkSubmission(){
	const submittedFlag = document.querySelector('#Submit_Flag input[type="text"]').value.trim();
	const email = getEmail();
	const flagID = getCurrentFlagID();
	console.log("FLAG ID IS", flagID);
	const flagName = document.getElementById('Flag_Name').textContent;
	if(!submittedFlag){
		document.getElementById('Submission_Result').textContent = "Please enter a flag.";
		return;
	}
	const res = await fetch('/checkFlagSubmission', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json'},
		body: JSON.stringify({ email, flagID, submittedFlag })
	});;
	const result = await res.json();
	const resultelement = document.getElementById('Submission_Result');
	if(result.correct){
		resultelement.classList.add('Correct :)');
		resultelement.classList.remove('Incorrect');
		resultelement.textContent = 'Correct!';
	}
	else{
		resultelement.classList.add('Incorrect');
		resultelement.classList.remove('Correct');
		resultelement.textContent = 'Incorrect! :(';
	}
}
