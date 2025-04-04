/*
********************************************************************
	Alex Miller
	Jordan Latimer
	
	CTF Server Code 
********************************************************************
*/

// IP and PORT
const port = 3000;
const ip = 'localhost';

// requires
const path = require('path');
const express = require('express');
const http = require('http');
const cors = require('cors');
const crypto = require('crypto');
const Docker = require('dockerode');
const DockerStreamCleanser = require('docker-stream-cleanser');
const WebSocket = require('ws');
const app = express();
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const exec = require('child_process');
const multer = require('multer');

// express stuff
app.use(express.static(path.join(__dirname, '/')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const upload = multer();


/*
********************************************************************
	On Connection
********************************************************************
*/

// start the server with the socket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// on connection to the server
wss.on('connection', async (ws) => {
	console.log('***** Connection Made *****');
    
	ws.on('message', async (message) => {

		// get the first message into the socket
		let messagestring = Buffer.isBuffer(message) ? message.toString('utf-8') : message;
		messagestring = messagestring.substring(1,messagestring.length-1);

		// if it's an email, create the container
		if(messagestring !== undefined && IsEmail(messagestring)) {
			try {
				const container = await CheckContainer(messagestring);
				getActiveFlagImage(messagestring).then((image) => {
					placeFlag(messagestring, container, image);
				});

				container.exec({
					Cmd: ['/bin/bash'],
					AttachStdin: true,
					AttachStdout: true,
					AttachStderr: true,
					Tty: true,
				}, (err, exec) => {
					if (err) {
						return ws.send('Error: ' + err.message);
					}

					// take over the container via terminal in contest pages
					exec.start({ hijack: true, stdin: true, stdout: true, stderr: true}, (err, stream) => {
						
						// used to get rid of header from docker buffer
						const cleanser = new DockerStreamCleanser();
						
						if (err) {
							return ws.send('Error: ' + err.message);
						}

						// both docker container sending and terminal recieving 
						stream.pipe(cleanser).on('data', (data) => {
							ws.send(data.toString());
						});

						stream.on('error', (err) => {
							console.log('stream error: ' + err);
						});

						// from terminal to docker container
						ws.on('message', (message) => {
							stream.write(message.toString());
						});

						// connection closes
						ws.on('close', async () => {
							try { // try deleting container
								clearActiveFlag(messagestring);
								console.log('Deleting Container: ' + container.id);
								await container.kill();
								await container.remove({ force: true });
								console.log('----- Container: ' + container.id + ' has been deleted -----');
							} catch (err) { // error catching
								if (err.statusCode === 409) {
									const cont = docker.getContainer(container.id);
									cont.start();
									cont.kill();
									cont.remove({ force: true });
								}
								else if (err.statusCode === 404) console.log('404');
								else console.error(err);
							}
						});
					});
				});
			} catch(err){
				console.error('Error handling connection:', err.message);
			}
		}
	});
});


/*
********************************************************************
	Get Requests
********************************************************************
*/

// login page
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/Login.html');
});

// Admin Contest page
app.get('/Admin_Contest', (req, res) => {
  res.sendFile(__dirname + '/(A)Contest_Page.html');
});

// User Contest page
app.get('/User_Contest', (req, res) => {
  res.sendFile(__dirname + '/Contest_Page.html');
});

// User menu page
app.get('/User_Menu', (req, res) => {
	res.sendFile(__dirname + '/User_Menu.html');
});

// User Menu Screen
app.get('/User_Contest', (req, res) => {
	res.sendFile(__dirname + '/User_Menu.html');
})

// Admin Modify Contest Screen
app.get('/Admin_Contest', (req, res) => {
	res.sendFile(__dirname + '/Modify_Contests.html')
});



/*
********************************************************************
	Docker Containers
********************************************************************
*/

// create a new docker
const docker = new Docker();

// creating container
async function CreateContainer(email) {
	console.log('Creating Container for ' + email);
	let username = getUsername(email);
	
	// get the active flag image for that user and use that to create the container
	return getActiveFlagImage(email).then(async (image) => {
		if(image === undefined || image.ActiveFlag === null || image.ActiveFlag == 'ubuntu') {
			return await StartContainer('ubuntu', username, email);
		}
		else
			return await StartContainer(image.ActiveFlag, username, email);
	}).catch((err) => {
		console.error('Error in CreateContainer:', err.message);
	});
}

// Create and Start the container with correct image
async function StartContainer(image, username, email) {

	// create container
	try {
		const container = await docker.createContainer({
			Image: image,
			Cmd: ['/bin/bash'],
			AttachStdin: true,
			AttachStdout: true,
			AttachStderr: true,
			StdinOnce: false,
			OpenStdin: true,
			Tty: true,
			Detach: false,
			Hostname: username,
			name: username
		});

		// start container
		console.log('starting container', container.id);
		await container.start();
		console.log('+++++ Container started for ' + username + ' with ID: ' + container.id + ' +++++');
		return container;
	} catch (err) {
		if (err.statusCode === 409 || err.statusCode === 404) { // confliction or if container doesn't exist
			return CheckContainer(email);
		}
		else console.error(err);
	}
}

// check if there is a container already created and started with the specific email
async function CheckContainer(email) {
	try { // remove container if that container already exists
		console.log('Checking container for email:', email);

		const cont = await docker.getContainer(getUsername(email));
		const info = await cont.inspect();
		if(info.State.Running){
			await cont.kill();
			await cont.remove({ force: true});
		}
		return await CreateContainer(email);
	} catch(err) {
		if(err.statusCode === 404) {
			return await CreateContainer(email);
		}
		console.error('Error checking container:', err.message);
	}
};


/*
********************************************************************
	POST Requests for Database
********************************************************************
*/

// DATABASE
var mysql = require('mysql');

var con = mysql.createConnection({
	host:"nmucapflag.ddns.net",
	user: "Alex",
	password: "password",
	database: "NMUCAPFLAG"
})

con.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
});

// login to website
app.post('/login', async (req, res) => {
	const { email, password } = req.body;

	// Admin Login
	let row = await getUserByEmail('Admins', email);
	if (row) {
		if (email === row.Email && password === row.Password) return res.status(200).json({ redirectTo: '/Admin_Contest', email: email });
		else return res.status(400).json({ error: 'INVALID CREDENTIALS' });
	}

	// User Login
	row = await getUserByEmail('Users', email);
	if (row) {
		if (email === row.Email && password === row.Password) return res.status(200).json({ redirectTo: '/User_Menu', email: email });
		else return res.status(400).json({ error: 'INVALID CREDENTIALS' });
	}
	else {
		return res.status(500).json({ error: 'SERVER ERROR' });
	}

});

// add a contest to the database
app.post('/AddContest', (req,res) => {
	const { Name, IsActive, email, Desc } = req.body;
	return getAdminID(email).then((Admin) => {
		const query = 'INSERT INTO CONTESTS (Name, IsActive, AdminID, Description) VALUES (?,0,?,?)';
		con.query(query, [Name, Admin.AdminID, Desc], (err) => {
		if (err) {
			console.error(err.message);
			return res.status(500).json({ error: 'INSERTING NEW CONTEST' });
		}
			return res.status(200).json({ success: true });
		});
	})
});

// Set a specific contest active for a specific Admin
app.post('/setContestActive', (req,res) => {
	const { contest, email } = req.body;
	return getAdminID(email).then((Admin) => {
		const query = 'SELECT * FROM Contests WHERE IsActive = 1 AND AdminID = ?';
		con.query(query, [Admin.AdminID], (err,rows) => {
			if (err) {
				console.error(err.message);
				return res.status(500).json({ error: 'SETTING CONTEST ACTIVE' });
			}
			if (rows.length === 0){
				// if contest not active yet, set the new contest to active
				const query = 'UPDATE Contests SET IsActive = 1 WHERE AdminID = ? AND ContestID = ?';
				con.query(query, [Admin.AdminID, contest], (err) => {
					if (err) {
						console.error(err.message);
						return res.status(500).json({ error: 'UPDATING CONTEST ACTIVE' });
					}
					if (this.changes === 0) return res.status(404).json({ error: 'CONTEST NOT FOUND' });
					else return res.status(200).json({ success: true });
				});
			}

			// if there is a contest active then deactivate that one first
			else {
				const query = 'UPDATE Contests SET IsActive = 0 WHERE AdminID = ? AND ContestID = ?';
				con.query(query, [Admin.AdminID,rows[0].ContestID], (err) => {
					if (err) {
						console.error(err.message);
						return res.status(500).json({ error: 'SETTING OLD CONTEST TO INACTIVE' });
					}
					const query = 'UPDATE Contests SET IsActive = 1 WHERE AdminID = ? AND ContestID = ?';
					con.query(query, [Admin.AdminID, contest], (err) => {
						if (err) {
							console.error(err.message);
							return res.status(500).json({ error: 'UPDATING CONTEST ACTIVE' });
						}
						if (this.changes === 0) return res.status(404).json({ error: 'CONTEST NOT FOUND' });
						else return res.status(200).json({ success: true });
					});
				});
			}
		});

		
	});
});

// get the current active contest of an Admin
app.post('/getActiveContest', (req,res) => {
	const { email } = req.body;
	return AdminorUser(email).then((ans) => {
		if (ans === 'Users') {
			return getAdminFromUser(email).then((Admin) => {
				const query = 'SELECT * FROM Contests WHERE IsActive = 1 AND AdminID = ?';
				con.query(query, [Admin.AdminID], (err,rows) => {
					if (err) {
						console.error(err.message);
						return res.status(500).json({ error: 'GETTING ACTIVE CONTEST' });
					}
					if (rows.length === 0)
						return res.status(404).json({ error: 'NO CONTEST FOUND' });
					return res.json(rows[0]);
				})
			});
		}
		else {
			return getAdminID(email).then((Admin) => {
				const query = 'SELECT * FROM Contests WHERE IsActive = 1 AND AdminID = ?';
				con.query(query, [Admin.AdminID], (err,rows) => {
					if (err) {
						console.log('here');
						console.error(err.message);
						return res.status(500).json({ error: 'GETTING ACTIVE CONTEST' });
					}
					if(rows.length === 0) return res.status(404).json({ error: 'NO CONTEST FOUND' });
					else return res.json(rows[0]);
				});
			});
		}
	}).catch((err) => {
		console.error(err.message);
		return res.status(500).json({ error: 'GETTING ACTIVE CONTEST' });
	});
});

// get all contests for specific Admin
app.post('/getContests', (req,res) => {
	const { email } = req.body;

	// determine if email is admin or user 
	return AdminorUser(email).then((ans) => {

		// if user then go into the user table and grab the foreign key for Admin
		if (ans === 'Users') {

			// get all the contests for that Admin
			return getAdminFromUser(email).then((Admin) => {
				const query = 'SELECT * FROM Contests WHERE AdminID = ?';
				con.query(query, [Admin.AdminID], (err,rows) => {
					if (err) {
						console.error(err.message);
						return res.status(500).json({ error: 'GETTING CONTESTS' });
					}
					if(rows.length === 0)
						return res.status(404).json({ error: 'NO CONTESTS FOUND' });
					return res.json(rows);
				});
			});
		}
		// if email is an Admin
		else {
			// get all contests for that Admin
			return getAdminID(email).then((Admin) => {
				const query = 'SELECT * FROM Contests WHERE AdminID = ?';
				con.query(query, [Admin.AdminID], (err,rows) => {
					if (err) {
						console.error(err.message);
						return res.status(500).json({ error: 'GETTING CONTESTS' });
					}
					if(rows.length === 0)
						return res.status(404).json({ error: 'NO CONTESTS FOUND' });
					return res.json(rows);
				});
			});
		}
	}).catch((err) => {
		console.error(err);
		return res.status(500).json({ error: 'COULD NOT GET CONTESTS' });
	});
});

app.post('/getContestByID', async (req, res) => {
	const { contestID } = req.body;
	if(!contestID)
		return res.status(400).json({error: 'No Contest ID'});
	try{
		const contest = await getContestByID(contestID);
		res.json(contest); 
	} catch(err){
		if(err.message === 'Contest not found'){
			return res.status(404).json({ error: 'Contest not found' });
		}
		else{
			console.error(err);
			res.status(500).json({ error: 'Internal server error' });
		}
	}
});

// end a current active contest
app.post('/EndContest', (req,res) => {
	const { contest, email } = req.body;
	const query = 'SELECT IsActive FROM Contests WHERE ContestID = ?';
	con.query(query, [contest], (err,rows) => {
		if (err) {
			console.error(err.message);
			return res.status(500).json({ error: 'ENDING CONTEST' });
		}

		// no row found in db
		if (rows.length === 0) return res.status(404).json({ error: 'CONTEST NOT FOUND' });

		// contest is already InActive
		if (rows[0].IsActive === 0) return res.status(400).json({ error: 'CONTEST ALREADY INACTIVE' });

		// update which contest is active
		else {
			const query = 'UPDATE Contests SET IsActive = 0 WHERE ContestID = ?';
			con.query(query, [contest], (err, result) => {
				if (err) {
					console.error(err.message);
					return res.status(500).json({ error: 'UPDATING CONTEST ISACTIVE' });
				}

				// contest doesn't exist
				if (this.changes === 0) return res.status(404).json({ error: 'CONTEST NOT FOUND' });
				return res.status(200).json({ success: true });
			});
		}
		
	});
});

// delete a specific contest from database
app.post('/DeleteContest', (req,res) => {
	const { contest } = req.body;
	const query = 'DELETE FROM Contests WHERE ContestID = ?';
	con.query(query, [contest], (err) => {
		if (err) {
			console.error(err.message);
			return res.status(500).json({ error: 'DELETING CONTEST' });
		}

		// contest doesn't exist
		if (this.changes === 0) return res.status(404).json({ error: 'CONTEST NOT FOUND' });
		return res.status(200).json({ success: true });
	});
});

// add a new flag to a specific contest
app.post('/AddFlag', (req,res) => {
	const { name, desc, contest, image, path, hint1, hint2, hint3} = req.body;
	
	// getting all the hints, whether how many
	let Hint1 = hint1 || '';
	let Hint2 = hint2 || '';
	let Hint3 = hint3 || '';

	const query = 'INSERT INTO FLAGS (Name, Description, ContestID, Image, Path, Hint1, Hint2, Hint3) VALUES (?,?,?,?,?,?,?,?)';
	con.query(query,
		[name, desc, contest, image, path, Hint1, Hint2, Hint3], (err) => {
			if (err) {
				console.error(err.message);
				return res.status(500).json({ error: 'INESERTING NEW FLAG' });
			}
			return res.status(200).json({ success: true });
	});

});

// Set new flag for specific user ActiveFlag
app.post('/setNewActiveFlag', (req,res) => {
	const { FlagImage, email } = req.body;
	return AdminorUser(email).then((table) => {
		const query = `UPDATE ${table} SET ActiveFlag = ? WHERE Email = ?`;
		console.log('New image:', FlagImage);
		con.query(query, [FlagImage,email], (err,rows) => {
			if (err) {
				console.error(err.message);
				return res.status(500).json({ error: 'SETTING ACTIVE FLAG' });
			}
			return res.status(200).json({ success: true });
		});
	});
});

// get the active flag of a specific user
app.post('/getActiveFlag', (req,res) => {
	const { email, contest } = req.body;
	return AdminorUser(email).then((table) => {
		const query = `SELECT ActiveFlag FROM ${table} WHERE Email = ?`;
		con.query(query, [email, contest], (err,rows) => {
			if (err) {
				console.log(err.message);
				return res.status(500).json({ error: 'GETTING ACTIVE FLAG' });
			}
			if (rows.length > 0 && rows[0].ActiveFlag !== null) {
				const activeFlag = rows[0].ActiveFlag;
				const imageObject = { ActiveFlag: activeFlag};
				return getFlagByImage(imageObject).then((flag) => {
					res.json(flag);
				});
			}
			else return res.status(500).json({ error: 'GETTING ACTIVE FLAG' });
		});
	});
});

app.post('/clearActiveFlag', (req, res) => {
	const {email} = req.body;
	console.log('Clearing active flag for:', email);
	AdminorUser(email).then((table) => {
		const query = `UPDATE ${table} SET ActiveFlag = ? WHERE Email = ?`;
		con.query(query, ['ubuntu',email], (err, rows) => {
			if(err) {
				console.error('Error clearing active flag:', err.message);
				return res.status(500).json({ error: 'CLEARING ACTIVE FLAG' });
			}
			if(rows.affectedRows === 0) console.log('No rows updated');
			return res.status(200).json({ success: true });
		})
	}).catch(err => {
		console.error('Error getting table:', err.message);
		return res.status(500).json({error: 'Error getting table'});
	})
})

// get every flag for a specific contest
app.post('/getAllFlagsFromContest', (req,res) => {
	const { contest } = req.body;
	const query = 'SELECT * FROM Flags WHERE ContestID = ?';
	con.query(query, [contest], (err,rows) => {
		if (err) {
			console.error(err.message);
			return res.status(500).json({ error: 'GETTING ALL FLAGS FOR CONTEST' });
		}
		res.json(rows);
	});
});

// get the contests and all the flags from that contest
app.post('/getContestFlagsSubs', (req,res) => {
	const { email, contest } = req.body;

	// get all of the contests
	return getContestIDFromNameAdminID(email,contest).then((contestID) => {
		return getFlagFromContestID(contestID.ContestID).then((flags) => {
			return getAllSubs().then((subs) => {
				return res.status(200).json({ flags: flags, subs: subs });
			});
		});
	});
});


// delete specific flag with FlagID
app.post('/DeleteFlag', (req,res) => {
	const { flag } = req.body;
	DeleteFlagFromSub(flag);
	const query = 'DELETE FROM Flags WHERE FlagID = ?';
	con.query(query, [flag], (err) => {
		if (err) {
			console.error(err.message);
			return res.status(500).json({ error: 'DELETING FLAG' });
		}
		if (this.changes === 0) return res.status(404).json({ error: 'FLAG NOT FOUND' });
		else return res.status(200).json({ success: true });
	});
});

// delete all flags from a specific contest
app.post('/DeleteFlagsFromContest', (req,res) => {
	const { contest } = req.body;
	
	// get all flags first and delete them from submissions
	return getFlagFromContestID(contest.ContestID).then((flags) => {
		for (var i=0; i < flags.length; i++) {
			DeleteFlagFromSub(flags[i].FlagID);
		}

		// delete them from contest
		const query = 'DELETE FROM Flags WHERE ContestID = ?';
		con.query(query, [contest], (err) => {
			if (err) {
				console.error(err.message);
			}
		});

		if (this.changes === 0) return res.status(404).json({ error: 'NO CONTEST' });
		return res.status(200).json({ success: true });
	})

});

// get all of the users with the same key as admin
app.post('/getAllUsers', (req,res) => {
	const { email } = req.body;
	return getAdminID(email).then((Admin) => {
		const query = 'SELECT * FROM Users WHERE AdminID = ?';
		con.query(query,[Admin.AdminID], (err,rows) => {
			if (err) {
				console.error(err.message);
				return res.status(500).json({ error: 'GETTING USERS '});
			}
			if(rows.length === 0)
				res.status(404).json({ error: 'NO ADMIN/USERS FOUND '});
			else
				res.json(rows); 
		});
	});
});

// get all the info for leaderboards
app.post('/FillLeaderboard', (req,res) => {
	const { email, contest } = req.body;
	return AdminorUser(email).then((AoU) => {
		if (AoU === 'Admins') {
			return getAdminID(email).then((Admin) => {
				return getUsersFromAdmin(Admin.AdminID).then((users) => {
					return getContestIDFromName(contest).then((contestID) => {
						return getFlagFromContestID(contestID[0].ContestID).then((flags) => {
							return getAllSubs().then((subs) => {
								return res.status(200).json({ users: users, flags: flags, subs: subs, contestID: contestID });
							});
						});
					});
				});
			});
			
		}
		else {
			return getAdminFromUser(email).then((Admin) => {
				return getUsersFromAdmin(Admin.AdminID).then((users) => {
					return getContestIDFromName(contest).then((contestID) => {
						return getFlagFromContestID(contestID[0].ContestID).then((flags) => {
							return getAllSubs().then((subs) => {
								return res.status(200).json({ users: users, flags: flags, subs: subs, contestID: contestID });
							});
						});
					});
				});
			});
		}
	});
	
});

// add a student to the database
app.post('/AddStudent', (req,res) => {
	const { name, email, Aemail, password } = req.body;
	return getAdminID(Aemail).then((Admin) => {
		const query = `INSERT INTO Users (Name, Email, Password, Flags, AdminID) VALUES (?,?,?,0,?)`;
		con.query(query, [name, email, password,Admin.AdminID], (err) => {
			if (err) {
				console.error(err.message);
				return res.status(500).json({ error: 'INSERTING NEW STUDENT' });
			}
			return res.status(200).json({ success: true });
		});
	});
});

// return everything on a user by email
app.post('/getUser', (req,res) => {
	const { email } = req.body;
	return getUserByEmail('Users',email).then((row) => {
		if (row) res.json(row);
		else return res.status(404).json({ error: 'USER NOT FOUND' });
	})
});

// set the new name of the user
app.post('/setUserName', (req,res) => {
	const { name, email } = req.body;
	const query = 'UPDATE Users SET Name = ? WHERE Email = ?';
	con.query(query, [name,email], (err) => {
		if (err){
			console.error(err.message);
			return res.status(500).json({ error: err });
		}
		return res.status(200).json({ success: true });
	});
});

// update a student in the database
app.post('/UpdateStudent', (req,res) => {
	const { email, password } = req.body;
	const query = 'UPDATE Users SET Password = ? WHERE Email = ?';
	con.query(query, [password, email], (err) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ error: 'UPDATING STUDENT!' });
		}
		return res.status(200).json({ success: true });
	});
});

// delete a student from the database
app.post('/DeleteStudent', (req,res) => {
	const {email} = req.body;
	const query = "DELETE FROM Users WHERE Users.Email = ?";
	con.query(query, [email], function(err,rows) {
		if (err) {
			console.error(err.message);
			return res.status(500).json({ error: "DELETING STUDENT" });
		}

		// contest doesn't exist
		if (this.changes === 0) return res.status(404).json({ error: "NO STUDENT" });
		return res.status(200).json({ success: true });
	});
});

// create an Image
app.post('/AddImage', upload.any('files'), (req,res) => {
	
	// parse the json data that came in and the files
	const jsondata = req.body.data;
	let parsedjsondata = JSON.parse(jsondata);
	const files = req.files;

	// get all of the values
	const root = parsedjsondata.root;
	const imgname = parsedjsondata.imgname;
	const email = parsedjsondata.email;

	// create image and return
	CreateImage(root, imgname, email, files);
	return res.status(200).json({ success: true });
});

// get all images for Admin
app.post('/getImages', (req,res) => {
	const { email } = req.body;
	getAdminID(email).then((Admin) => {
		const query = 'SELECT Name FROM Images WHERE AdminID = ?';
		console.log(Admin);
		con.query(query, [Admin.AdminID], (err,rows) => {
			if (err) {
				console.error(err.message);
				return res.status(500).json({ error: 'GETTING IMAGES' });
			}
			res.json(rows);
		});
	})
});

app.post('/updateContainer/:email', async(req, res) => {
	const { email } = req.params;
	try{
		await CheckContainer(email);
		res.status(200).json({ message: 'container updated'});
	} catch(err) {
		console.error('Error updating container', err.message);
		res.status(500).json({error: 'Error updating container.'});
	}
})

// delete image and replace the image of the flag that's using it
app.post('/DeleteImageReplaceFlags', (req,res) => {
	const { images } = req.body;

	return getAllFlags().then((flags) => {
		for (var i=0; i < flags.length; i++) {
			
			// if the flag's image is being deleted change it to ubuntu
			if (flags[i].Image === images) {
				ResetFlagImage(flags[i]);
			}
		}

		// delete the images from the database and from docker
		if (images === 'ubuntu') return res.status(201).json({ success: true });
		else {
			DeleteImage(images);
			try {
				exec.execSync(`docker rmi -f ${images}`);
			} catch (err) {
				console.error(err.message);
			}
		}
			

		return res.status(200).json({ success: true });
	});
});

app.post('/checkFlagSubmission', async (req, res) => {
	const { email, flagID, submittedFlag } = req.body;
	const correctFlag = getFlagHash(email, flagID);
	const userQuery = 'SELECT UserID FROM Users WHERE Email = ?';
	con.query(userQuery, [email], (err, userRows) => {
		if(err)
			return res.status(500).json({correct: false, message: 'Database error'});
		if(userRows.length === 0)
			return res.json({correct: false, message: 'User not found'});
		const userID = userRows[0].UserID;
		const submissionQuery = 'SELECT * FROM Submissions WHERE UserID = ? AND FlagID = ?';
		con.query(submissionQuery, [userID, flagID], (err, submissionsRows) => {
			if(err)
				return res.status(500).json({correct: false, message: 'Database error'});
			if(submittedFlag === correctFlag){
				if(submissionsRows.length === 0){         //If the submission is correct and it is their first submission.
					const insertQuery = 'INSERT INTO Submissions (UserID, FlagID, IsCorrect, Attempts) VALUES (?, ?, 1, 1)';
					con.query(insertQuery, [userID, flagID], (err) => {
						if(err)
							return res.status(500).json({correct: false, message: 'Database error'});
						const updateFlagsQuery = 'UPDATE Users SET Flags = Flags + 1 WHERE UserID = ?';
						con.query(updateFlagsQuery, [userID], (err) => {
							if(err)
								return res.status(500).json({correct: false, message: 'Database errr'});
							return res.json({correct: true, message: 'Correct flag submitted!'});
						});
					});
				}
				else{                  //If the submission is correct and it is not their first submission
					const updateQuery = 'UPDATE Submissions SET IsCorrect = 1, Attempts = Attempts + 1 WHERE UserID = ? AND FlagID = ?';
					con.query(updateQuery, [userID, flagID], (err) => {
						const updateFlagsQuery = 'UPDATE Users SET Flags = Flags + 1 WHERE UserID = ?';
						con.query(updateFlagsQuery, [userID], (err) => {
							if(err)
								return res.status(500).json({correct: false, message: 'Database errr'});
							return res.json({correct: true, message: 'Correct flag submitted!'});
						});
					});
				}
			}
			else{
				if(submissionsRows.length === 0){     //If the submission is incorrect and it is their first submssion
					const insertQuery = 'INSERT INTO Submissions (UserID, FlagID, IsCorrect, Attempts) VALUES (?, ?, 0, 1)';
					con.query(insertQuery, [userID, flagID], (err) => {
						if(err)
							return res.status(500).json({correct: false, message: 'Databsae error'});
						return res.json({correct: false, message: 'Incorrect flag. Try Again.'});
					});
				}
				else {          //If their submission is incorrect and it is not their first submission
					const updateQuery = 'UPDATE Submissions SET Attempts = Attempts + 1 WHERE UserID = ? AND FlagID = ?';
					con.query(updateQuery, [userID, flagID], (err) => {
						if(err)
							return res.status(500).json({correct: false, message: 'Database error'});
						return res.json({correct: false, message: 'Incorrect flag. Try Again'});
					});
				}
			}
		});
	});
});

/*
********************************************************************
	GET Requests for Database
********************************************************************
*/


// get every flag inside db
app.get('/getAllFlags', (req,res) => {
	const query = 'SELECT * FROM Flags';
	con.query(query, [], (err,rows) => {
		if (err) {
			console.error(err.message);
			return res.status(500).json({ error: 'GETTING ALL FLAGS FROM DB' });
		}
		res.json(rows);
	});
});





/*
********************************************************************
	Database Functions
********************************************************************
*/

// get the active flag from specific user
async function getActiveFlagImage(email) {
	console.log(`Getting active flag for ${email}`);
	return new Promise((resolve, reject) => {
		const query = 'SELECT ActiveFlag FROM Users WHERE Email = ?';
		con.query(query, [email], (err,rows) => { // check users table
			if (err) { // error
				console.error('Error fetching from Users table: ', err.message);
				reject(err);
			}
			if (rows.length === 0) {
				console.log('no active flag for user, checking admins...');
				const query = 'SELECT ActiveFlag FROM Admins WHERE Email = ?';
				con.query(query, [email], (err,rows) => { // check admins table
					if (err) { // error
						console.error('Error fetching from Admins table: ', err.message);
						reject(err);
					}
					resolve(rows[0]);
				})
			}
			else{
				console.log('Active flag from users table: ', rows[0]);
				resolve(rows[0]);
			} 
		});
	});

}

// get the contest ID from the contest name
async function getContestIDFromName(contestname) {
	return new Promise((resolve,reject) => {
		const query = 'SELECT ContestID FROM Contests WHERE Name = ?';
		con.query(query,[contestname],(err,row) => {
			if (err) {
				console.error(err.message);
				reject(err);
			}
			resolve(row);
		});
	});
}

// get contest ID from an email and the name of the contest
async function getContestIDFromNameAdminID(email, contestname) {
	return getAdminID(email).then((Admin) => {
		return new Promise((resolve,reject) => {
			const query = 'SELECT ContestID FROM Contests WHERE AdminID = ? AND Name = ?';
			con.query(query,[Admin.AdminID,contestname], (err,row) => {
				if (err) {
					console.error(err.message);
					reject(err);
				}
				resolve(row[0]);
			});
		})
	});
}

// get a flag from a specific contest
async function getFlagFromContestID(contestID) {
	return new Promise((resolve, reject) => {
		const query = 'SELECT * FROM Flags WHERE ContestID = ?';
		con.query(query, [contestID], (err,rows) => {
			if (err) {
				console.error(err.message);
				reject(err);
			}
			resolve(rows);
		});
	});
}

async function getContestByID(contestID){
	return new Promise((resolve, reject) => {
		const query = 'SELECT * FROM Contests WHERE ContestID = ?';
		con.query(query, [contestID], (err, rows) => {
			if(err) {
				console.error(err.message);
				reject(err);
			}
			if(rows.length === 0){
				return reject(new Error('Contest not found'));
			}
			resolve(rows[0]);
		});
	});
}

// get a user from either table with email
async function getUserByEmail(table, email) {
	return new Promise((resolve, reject) => {
		const query = `SELECT * FROM ${table} WHERE Email = ?`;
		con.query(query, [email], (err, rows) => {
			if (err) {
				console.error(err.message);
				reject(err);
			}
			resolve(rows[0]);
		});
	});
}

// get all users from an AdminID
async function getUsersFromAdmin(AdminID) {
	return new Promise((resolve,reject) => {
		const query = 'SELECT * FROM Users WHERE AdminID = ?';
		con.query(query, [AdminID], (err,rows) => {
			if (err) {
				console.error(err.message);
				reject(err);
			}
			resolve(rows);
		})
	});
}

// get whether the email belongs to an admin or a user
async function AdminorUser(email) {
	return new Promise((resolve, reject) => {
		const query = 'SELECT COUNT(*) AS count FROM Admins WHERE Email = ?';
		con.query(query, [email], (err,rows) => {
			if(err) {
				console.error(err.message);
				reject(err);
			}
			if (rows[0].count > 0)
				resolve('Admins');
			else
				resolve('Users');
		});
	})
}

// get a flag by the image name
async function getFlagByImage(image) {
	//console.log("looking for your image: ", image.ActiveFlag);
	const flagImage = image.ActiveFlag;
	return new Promise((resolve, reject) => {
		const query = 'SELECT * FROM Flags WHERE Image = ?';
		con.query(query, [flagImage], (err,rows) => {
			if (err) {
				console.error(err.message);
				reject(err);
			}
			if(rows.length === 0)
				return resolve('ubuntu');
			resolve(rows[0]);
		});
	});
}

// get the Admin Key by email
async function getAdminID(email) {
	return new Promise((resolve, reject) => {
		const query = 'SELECT AdminID FROM Admins WHERE Email = ?';
		con.query(query, [email], (err,rows) => {
			if (err) {
				console.error(err.message);
				reject(err);
			}
			resolve(rows[0]);
		});
	});
}

// get the Admin foreign key from User table
async function getAdminFromUser(email) {
	return new Promise((resolve,reject) => {
		const query = 'SELECT AdminID FROM Users WHERE Email = ?';
		con.query(query, [email], (err,rows) => {
			if (err) {
				console.error(err.message);
				reject(err);
			}
			resolve(rows[0]);
		});
	});
}

async function clearActiveFlag(email){
	try{
		const table = await AdminorUser(email);
		const query = `UPDATE ${table} SET ActiveFlag = ? WHERE Email = ?`;
		con.query(query, ['ubuntu', email], (err, rows) => {
			if(err) { 
				console.error('Error clearing flag', err.message);
				return;
			}
			if(this.changes === 0)
				console.log('No rows affected');
			console.log(`Active flag cleared for ${email}`);
		});
	} catch (err) { console.error('Error clearing active flag', err.message); }
}

// add the image name to the db of images
async function AddImage(Admin,imgname) {
	const query = 'INSERT INTO Images (Name,AdminID) VALUES (?,?)';
	con.query(query, [imgname,Admin.AdminID], (err) => {
		if (err) {
			console.error(err.message);
		}
	})
}

// get all of the flags
async function getAllFlags() {
	return new Promise((resolve, reject) => {
		const query = 'SELECT * FROM Flags';
		con.query(query, [], (err,rows) => {
			if (err) {
				console.error(err.message);
				reject(err);
			}
			resolve(rows);
		});
	});
};

// reset the flag to ubuntu image
async function ResetFlagImage(flag) {
	const query = 'UPDATE Flags SET Image = ? WHERE FlagID = ?';
	con.query(query, ['ubuntu', flag.FlagID], (err) => {
		if (err) {
			console.error(err.message);
		}
	});
}

// delete an image from the database
async function DeleteImage(image) {

	const query = 'DELETE FROM Images WHERE Name = ?';
	con.query(query, [image], (err) => {
		if (err) {
			console.error(err.message);
		}
	});
}

// delete flags attempts from submissions
async function DeleteFlagFromSub(flag) {
	const query = 'DELETE FROM Submissions WHERE FlagID = ?';
	con.query(query, [flag], (err) => {
		if (err) {
			console.error(err.message);
		}
	});
}

// get all of the submissions
async function getAllSubs() {
	return new Promise((resolve,reject) => {
		const query = 'SELECT * FROM Submissions';
		con.query(query,[],(err,rows) => {
			if (err) {
				console.error(err.message);
				reject(err);
			}
			resolve(rows);
		})
	});
}

/*
********************************************************************
	Functions
********************************************************************
*/

// get the username portion of the email sent over
function getUsername(email) {
	let username = '';
	for (var i=0; i < email.length-1; i++) {
		if (email[i] != '@') username += email[i];
		else {
			return username;
		}
	}
}

// Returns true if the string is an email
function IsEmail(email) {
	for (let i=0; i < email.length; i++) {
		if (email[i] === "@") return true;
	}
	return false;
}

// create an image with the given tree
function CreateImage(root, imgname, email, files) {

	// get the Admin for database and file path
	getAdminID(email).then(async (Admin) => {
		
		// add the image to the database
		AddImage(Admin,imgname);


		// go into directory and check if folder exists
		const ImageDir = path.join(__dirname, 'AdminImages');
		const AdminDir = path.join(ImageDir, Admin.AdminID.toString());

		// if the path doesn't exist, create it
		try {
			if (!fs.existsSync(AdminDir)) {
				fs.mkdirSync(AdminDir);
			}

			// remove the old dockerfiles and root folder for the new one
			else {
				try {

					// get all of the files
					const oldfiles = fs.readdirSync(AdminDir);

					// loop through all the files
					for (var i=0; i < oldfiles.length; i++) {
						const filepath = path.join(AdminDir,oldfiles[i]);
						const stat = fs.statSync(filepath);
						
						// delete depending on if its a folder or file
						if (stat.isFile()) {
							fs.unlinkSync(filepath);
						}
						else if (stat.isDirectory()) {
							fs.rmdirSync(filepath, { recursive: true });
						}
					}
				} catch (err) {
					console.error(err);
				}
			}
		} catch (err) {
			console.error(err);
		}

		// get the dockerfile extension
		let name = imgname;
		imgname = imgname + '.dockerfile';

		// create the filepath
		const imagefile = path.join(AdminDir,imgname);
		
		// get all the required image content onto the file first
		RunCommand('FROM ubuntu:latest\r\nENV DEIAN_FRONTENT=noninteractive\r\nWORKDIR /.\r\nCMD ["bin/bash"]\r\n');

		// start getting contents of files and put into dockerfile
		await getContents(root,AdminDir);
		RunCommand('COPY Root /. \r\n');

		RunCommand('ENTRYPOINT ["/bin/sh","-c","sleep infinity"]');

		// create dockerfile into an image
		try {
			exec.exec(`cd AdminImages/${Admin.AdminID} && docker build -f ${imgname} -t ${name} .`, { encoding: 'utf-8' });
		} catch (err) {
			 console.error(err.message);
		}

		// get all the contents of the files and create the file system
		async function getContents(node, filepath) {
			
			// create the current folder if folder
			if (node.directory === true) {

				fs.mkdirSync(filepath+ '/' + node.name);
				filepath = path.join(filepath,node.name);

				// if directory has children
				if (node.children.length > 0) {
					for (var i=0; i < node.children.length; i++) {
						getContents(node.children[i], filepath);
					}
				}
			}

			// node is a file
			else {

				let file = null;
				// get the correct file
				for (var i=0; i < files.length; i++) {
					if (files[i].originalname === node.name) {
						file = files[i];
					}
				}
				const newfilepath = filepath + '/' + node.name;

				// not a file from drop box
				if (file === null) {
					file = new File([node.content], node.name, {type: 'text/plain', mode: 0o777 });
					fs.writeFileSync(newfilepath, node.contents);
				}

				// file from dropbox
				else {
					const buffer = Buffer.from(await file.buffer);
					await fs.promises.writeFile(newfilepath,buffer);
				}
			}
		}

		// run a command into dockerfile
		function RunCommand(command) {
			fs.appendFileSync(imagefile,
				command, 
				(err) => {
					if (err) {
						console.error('Error Creating DockerFile: ',err);
					}
				}
			)
		}
	});
}

// Hashing the flag for the user
function getFlagHash(email, flagID) {
	const hash = crypto.createHash('sha256').update(email + flagID).digest('hex');
	let digithash = hash.substring(0, 8);
  	const flag = 'NMUCTF${' + digithash + '}';
  	return flag;
}

async function placeFlag(messagestring, container, image){
	try{
		console.log("got here 1");
		console.log(image);
		
		const flag = await getFlagByImage(image);
		console.log(image);
		if (image.ActiveFlag === 'ubuntu') return; // return if no flag so ubuntu
		const FlagHash = getFlagHash(messagestring, flag.FlagID);
		console.log("The flag is", flag);
		console.log("The file path is", flag.Path);
		const containerInfo = await container.inspect();
		if (!containerInfo.State.Running){
			console.error('Container is not running');
			return;
		}
		const exec = await container.exec({
			Cmd: ['/bin/bash', '-c', `echo '${FlagHash}' > ${flag.Path}`],
		});
	
		exec.start({hijack: true, stdin: true, stdout: true, stderr: true}, (err, stream) => {
			if(err){
				console.log('Exec error:', err);
				return;
			}
			stream.on('data', (data) => {
				console.log('Exec Output:', data.toString());
			});
			stream.on('error', (err) => {
				console.error('Stream error:', err);
			});
				// Wait until the exec process finishes
			stream.on('end', () => {
				console.log("Exec process completed.");
			});
				//await new Promise((resolve) => stream.on('end', resolve));
		});
	} catch(err){
		console.error('Error in placeFlag:', err.message);
	}
}

/*
********************************************************************
	Server Start
********************************************************************
*/

// start server on port
server.listen(port, ip, () => {
	console.log('Server started at http://' + ip + ":" + port);
});