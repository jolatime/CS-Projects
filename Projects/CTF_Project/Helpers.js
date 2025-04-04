/*
    Jordan Latimer
    Alex Miller

    Helper functions used by a variety of javascript files
*/

// get the email of the client
function getEmail() {
	const url = window.location.search;
	const params = new URLSearchParams(url);
	return params.get('email');
}

// got to a specific page
function gotoPage(page, extras) {
	let location = page + getEmail();
	console.log(extras);
	if (extras !== undefined) window.location.href = location + '&' + extras;
	else window.location.href = location;
}

// popup window for a specific page with the email
function Popup(site,email,extras) {

    const width = 500;
    const height = 500;

    // get the right placement and size for any screen
    const x = screenX + (window.screen.width / 2) - (width / 2);
    const y = screenY + (window.screen.height / 2) - (height / 2);

    // add the features and the email inside the URL and open the window
    const features = `width=${width},height=${height},left=${x},top=${y}`;
    const params = new URLSearchParams(email).toString();
    const url = `${site}?`;
    if (email !== undefined) window.open(url + `email=${encodeURIComponent(email)}`,'popup',features);
    if (extras !== undefined || extras !== null) window.open(url + `email=${encodeURIComponent(email)}` + '&' + extras,'popup',features);
	else window.open(url,'popup',features);
}

// get all the table contents and add them in the respective table
async function PopulateTable(page) {
	const data = { email: getEmail() };
	const res = await fetch('/getContests', {
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

const flagItems = document.querySelectorAll('#Flag_Sidebar li');
flagItems.forEach(item => {
	item.addEventListener('click', function() {
		flagItems.forEach(f => f.classList.remove('selected-flag'));
		item.classList.add('selected-flag');
	})
});

// clear the terminal
function clearTerminal(){
	term.write("\x1b[2J");
	term.write("\x1b[H");
	term.write('Loading Environment...');
}

// update the container
async function updateContainer(email){
	const res = await fetch(`/updateContainer/${email}`, { method: 'POST'});

	if(res.ok){
		console.log('Container updated successfully');
	}
		
	else
		console.log('Failed to update container');
}

// reattach the terminal web socket
async function reattachTerminal(){
	console.log('reattaching termnial');

	if(term) term.dispose();
	term = new Terminal();
	term.open(document.getElementById('Linux_Shell'));
	const socket = new WebSocket('ws://localhost:3000');
	socket.onopen = () => {
		socket.send(JSON.stringify(getEmail()));
		console.log('Websocket opened');
	}
	const attachAddon = new AttachAddon.AttachAddon(socket);
	term.loadAddon(attachAddon);
	term.focus();
	socket.onclose = () => {
		console.log("socket closed");
	}
}