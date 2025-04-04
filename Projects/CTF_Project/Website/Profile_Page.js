/*
    Alex Miller
    Jordan Latimer

    Client code for Profile Page for Users
*/


// sets of names to pull randomly from for random names
let Adjectives = [
    'Aspiring', 'Strict','Electronic','Talented','Gifted','Wonderful',
    'Amazing','Inspiring','First','Second','Third','Cowardly','True',
    'Coordinated','Sneaky','Concerned','Courageous','Nice','Mean','Sharp',
    'Mysterious','Magical','Tame','Well-off','Overconfident','Cautious',
    'Wandering','Wrathful','Important','Jolly','Mistaken','Admirable'
]
let Animals = [
    'Fox','Turtle','Penguin','Robin','Shark','Giraffe','Kangaroo','Cat','Dog',
    'Fish','Bear','Lion','Hippo','Duck','Octopus','Elephant','Bunny','Rabbit',
    'Mouse','Pig','Cow','Chicken','Rooster','Ladybug','Firefly','Mosquito','Snail',
    'Koala','Platypus','Woodchuck','Polarbear','Rat','Bull','Newt','Deer','Fawn',
    'Cheetah','Leopard','Beaver','Llama','Guineapig','Squirrel','Eagle','Moose'
]
let Colors = [
    'Green', 'Blue','Aqua','Red','Purple','Pink','Gray','Black','Brown','Teal',
    'Limegreen','White','Yellow','Maroon','Violet', 'Coral','Emerald','Orange',
    'Darkgreen','Navyblue','Cyan','Crimson','Bronze','Gold','Silver','Amber',
    'Turquoise','Indigo','Fuchsia','Magenta','Platinum','Tan','Jade','Ruby'
]
let Things = [
    'Chair','Desk','Lamp','Keys','Bottle','Wall','Window','Barn','House','Door',
    'Outlet','TV','Screen','Road','Lightbulb','Sidewalk','Keyboard','Paper','Plastic',
    'Remote','Phone','Computer','Can','Table','Backpack','Fan','Carpet','Pen','Pencil',
    'Notebook','Clock','Tree','Pants','Shorts','Flannel','Jacket','Apple','Banana','Watch',
    'Apricot','Socks','Pizza','Pasty','Car','Airplane','Bus','Scissors','Rock','Water'
]
let Name = '';

// on load, populate tables and set the users name inside the input field
window.onload = async function() {
    PopulateTable(1);
    const data = { email: getEmail() };
    const res = await fetch('getUser', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(data)
    })
    if (res.ok) {
        const ret = await res.json();
        document.getElementById('NameInput').value = ret.Name;
    }
}

// populate both user tables
async function PopulateUserTables(PCData) {
    const TB = document.querySelector('#Past_Contests tbody');
    TB.innerHTML = "";

    // get all of the flags
    const res = await fetch('/getAllFlags');
    const PCData2 = await res.json();
    let totalflagamount = 0;

    // insert the amount of flags per contests
    PCData.forEach(contest => {
        let flagamount = 0;
        const row = document.createElement('tr');
        const name = document.createElement('td');
        name.textContent = contest.Name;
        const flags = document.createElement('td');
        PCData2.forEach(flag => {
            if (flag.ContestID === contest.ContestID) flagamount++;
        });
        flags.textContent = flagamount;
        totalflagamount += flagamount;

        const leader = document.createElement('td');
        
        // get the button for the leaderboard
		const leaderbutton = document.createElement('button');
		leaderbutton.textContent = 'view';
		leaderbutton.addEventListener('click', function() {
			Popup('leaderboard.html' ,getEmail(), 'ContestName=' + contest.Name);
		});
		leader.appendChild(leaderbutton);


        // add to the table
        row.appendChild(name);
        row.appendChild(flags);
        row.appendChild(leader);

        TB.appendChild(row);
    });

    // get the user information
    const data = { email: getEmail() };
    const res2 = await fetch('/getUser', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (res2.ok) {
        const Rdata = await res2.json();

        const TB2 = document.querySelector('#Record tbody');
        TB2.innerHTML = '';

        // create the table for the users record, flags completed, and total flags
        const row = document.createElement('tr');
        const Total = document.createElement('td');
        const Completed = document.createElement('td');
        const record = document.createElement('td');
        Total.textContent = totalflagamount;
        Completed.textContent = Rdata.Flags;
        record.textContent = Completed.innerHTML + ' / ' + Total.innerHTML;

        row.appendChild(Completed);
        row.appendChild(Total);
        row.appendChild(record);

        TB2.appendChild(row);
    }
    else {
        console.error('Error getting data for Flag Users');
    }
}

// get a new name from name array
function getNewName() {
    
    let first = '';
    let second = '';

    // get what arrays to be used
    let firstarr = Math.floor(Math.random() * 2);
    let secondarr = Math.floor(Math.random() * 2);

    // get the random array items based on the arrays used
    if (firstarr === 0) first = Adjectives[Math.floor(Math.random() * Adjectives.length)];
    else  first = Colors[Math.floor(Math.random() * Colors.length)];

    if (secondarr === 0) second = Animals[Math.floor(Math.random() * Animals.length)];
    else  second = Things[Math.floor(Math.random() * Things.length)];

    // set up the name
    Name = '';
    Name += first + second;

    // determine if there will be a random number after and add it
    let num = Math.floor(Math.random() * 2);
    if (num === 0) Name += Math.floor(Math.random() * 1001);

    document.getElementById('NameInput').value = Name;
}

// set the random name to the name of the user
async function setNewName() {
    const name = document.getElementById('NameInput').value;
    const data = { name: name, email: getEmail() };
    const res = await fetch('/setUserName', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(data)
    });

}