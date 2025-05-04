/*
    Alex Miller
    Jordan Latimer

    Client code for Profile Page for Users
*/
import { Contest } from '../models/contest.model';
import { Flag } from '../models/flag.model';
import { User } from '../models/user.model';
import { getEmail, Popup, InsertIntoTable, getContests } from './Helpers';

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
export async function loadTable(): Promise<string> {
    let contests = await getContests();
    PopulateUserTables(contests);
    const data = { email: getEmail() };
    const res = await fetch('api/users/getUsername', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(data)
    })
    if (res.ok) {
        const ret = await res.json();
        return ret;
    }
    return '';
}

// populate both user tables
export async function PopulateUserTables(PCData: Contest[]): Promise<void> {
    const TB = document.querySelector('#Past_Contests tbody') as HTMLElement;
    TB.innerHTML = "";

    // get all of the flags
    const res = await fetch('api/flags/getAllFlags');
    const PCData2: Flag[] = await res.json();
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
        flags.textContent = flagamount.toString();
        totalflagamount += flagamount;

        const leader = document.createElement('td');
        
        // get the button for the leaderboard
		const leaderbutton = document.createElement('button');
		leaderbutton.textContent = 'view';
        leaderbutton.setAttribute('id','ViewLeaderboard');
		leaderbutton.addEventListener('click', function() {
            Popup('/leaderboard');
			//Popup('leaderboard.html' ,getEmail(), 'ContestName=' + contest.Name); Uncomment when leaderboard is implemented
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
    const res2 = await fetch('api/users/getUser', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (res2.ok) {
        const Rdata = await res2.json();

        const TB2 = document.querySelector('#Record tbody') as HTMLTableSectionElement;
        if(TB2)
            TB2.innerHTML = '';

        // create the table for the users record, flags completed, and total flags
        const row = document.createElement('tr');
        const Total = document.createElement('td');
        const Completed = document.createElement('td');
        const record = document.createElement('td');
        Total.textContent = totalflagamount.toString();
        Completed.textContent = Rdata.Flags;
        record.textContent = Completed.innerHTML + ' / ' + Total.innerHTML;

        row.appendChild(Completed);
        row.appendChild(Total);
        row.appendChild(record);

        console.log('TB2:', TB2);
        console.log('row:', row);
        TB2.appendChild(row);
    }
    else {
        console.error('Error getting data for Flag Users');
    }
}

// get a new name from name array
export function getNewName(): string {
    
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

    return Name;
}

// set the random name to the name of the user
export async function setNewName(NameInput: string): Promise<void> {
    const name = NameInput;
    const data = { name: name, email: getEmail() };
    const res = await fetch('api/users/setUserName', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(data)
    });
}