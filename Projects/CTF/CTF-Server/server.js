/*
********************************************************************
	Alex Miller
	Jordan Latimer
	
	CTF Server Code 
********************************************************************
*/

// IP and PORT
const port = 3000;
const ioport = 3001;
const ip = 'localhost';

// imports
import login from "./routes/loginHandler.js";
import contestHandler from "./routes/contestHandler.js";
import flagHandler from "./routes/flagHandler.js";
import userHandler from "./routes/userHandler.js";
import submissionHandler from "./routes/submissionHandler.js"
import imageHandler from "./routes/imageHandler.js";
import con from "./db/dbconnection.js";
import { getFlagByImage, clearActiveFlag, getFlagFromContestID } from "./queries/flagQueries.js";
import { getAdminID } from "./queries/adminQueries.js";
import { getActiveFlagImage, AddImage} from "./queries/imageQueries.js";
import { getContestIDFromNameAdminID } from "./queries/contestQueries.js";
import { getAllSubs } from "./queries/submissionQueries.js";
import path from 'path';
import express from 'express';
import http from 'http';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import multer from 'multer';
import DockerStreamCleanser from 'docker-stream-cleanser';
import { WebSocketServer } from 'ws';
import { exec } from 'child_process'
import { fileURLToPath } from 'url';
import { Session } from "express-session";
import { CheckContainer } from "./containers/containers.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// express stuff
app.use(express.static(path.join(__dirname, '/')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage });


/*
********************************************************************
	On Connection
********************************************************************
*/

// start the server with the socket
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// on connection to the server
wss.on('connection', async (ws) => {
	console.log('***** Connection Made *****');
	ws.on('message', async (message) => {
		// get the first message into the socket
		let messagestring = Buffer.isBuffer(message) ? message.toString('utf-8') : message;
		messagestring = messagestring.substring(1,messagestring.length-1);
		console.log("MessageString:", messagestring);
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

/*app.use(Session({ secret: 'key',
				  resave: false,
				  saveUninitialized: false,
				  cookie: { secure: false, maxAge: 100 * 60 * 60 } //10 minutes
				}));*/


//ROUTES
app.use("/login", login);

app.use('/contests', contestHandler);

app.use('/flags', flagHandler);

app.use('/users', userHandler);

app.use('/submissions', submissionHandler);

app.use('/images', imageHandler);

//app.use('/admins', adminHandler);



/*
********************************************************************
	POST Requests for Database
********************************************************************
*/

// get the contests and all the flags from that contest
app.post('/getContestFlagsSubs', async (req,res) => {
	const { email, contest } = req.body;
	// get all of the contests
	return getContestIDFromNameAdminID(email,contest).then(async (contestID) => {
		console.log(contestID);
		const flags = await getFlagFromContestID(contestID);
		const subs = await getAllSubs();
		return res.status(200).json({ flags: flags, subs: subs });
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

// get whether the email belongs to an admin or a user
export async function AdminorUser(email) {
	return new Promise((resolve, reject) => {
		const query = 'SELECT COUNT(*) AS count FROM Admins WHERE Email = ?';
		con.query(query, [email], (err,rows) => {
			if(err) {
				console.error(err.message);
				reject(err);
			}
			if (rows[0].count > 0){
				resolve('Admins');
			}
			else{
				resolve('Users');
			}
		});
	})
}

/*
********************************************************************
	Functions
********************************************************************
*/

// get the username portion of the email sent over
export function getUsername(email) {
	let username = '';
	for (var i=0; i < email.length-1; i++) {
		if (email[i] != '@') username += email[i];
		else {
			return username;
		}
	}
}

// Returns true if the string is an email
export function IsEmail(email) {
	for (let i=0; i < email.length; i++) {
		if (email[i] === "@") return true;
	}
	return false;
}

// create an image with the given tree
export function CreateImage(root, imgname, email, files) {

	// get the Admin for database and file path
	getAdminID(email).then(async (Admin) => {
		
		// add the image to the database
		AddImage(Admin,imgname);

		// go into directory and check if folder exists
		const ImageDir = path.join(__dirname, 'AdminImages');
		const AdminDir = path.join(ImageDir, Admin.toString());

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
		RunCommand('FROM ubuntu:latest\r\nWORKDIR /.\r\nCMD ["bin/bash"]\r\n');
		// start getting contents of files and put into dockerfile
		await getContents(root,AdminDir, files);
		RunCommand('COPY Root /. \r\n');

		// create dockerfile into an image
		try {
			exec(`cd AdminImages/${Admin} && docker build -f ${imgname} -t ${name} .`, { encoding: 'utf-8' });
		} catch (err) {
			 console.error(err.message);
		}

		// get all the contents of the files and create the file system
		async function getContents(node, filepath, files) {

			// create the current folder if folder
			if (node.directory === true) {

				fs.mkdirSync(filepath+ '/' + node.name);
				filepath = path.join(filepath,node.name);

				// if directory has children
				if (node.children.length > 0) {
					for (var i=0; i < node.children.length; i++) {
						getContents(node.children[i], filepath, files);
					}
				}
			}

			// node is a file
			else {
				let file = null;

				// get the correct file
				if (files != null || files != undefined) {
					files.forEach((File) => {
						if (File.originalname === node.name) {
							file = File;
						}
					});
				}
				const newfilepath = filepath + '/' + node.name;

				// not a file from drop box
				if (file === null) {
					file = new File([node.content], node.name, {type: 'text/plain', mode: 0o777 });
					fs.writeFileSync(newfilepath, node.contents);
				}

				// file from dropbox
				else {
					const buffer = Buffer.from(file.buffer);
					await fs.promises.writeFile(newfilepath, buffer);
					console.log(newfilepath);
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
export function getFlagHash(email, flagID) {
	const hash = crypto.createHash('sha256').update(email + flagID).digest('hex');
	let digithash = hash.substring(0, 8);
  	const flag = 'NMUCTF${' + digithash + '}';
  	return flag;
}

export function getPracFlagHash() {
	const hash = crypto.createHash('sha256').update(email + flagID).digest('hex');
	let digithash = hash.substring(0, 8);
	for (let i=0; i < 8; i++) {
		let j = crypto.randomInt(0,20);
		digithash += hash[j];
	}
  	const flag = 'NMUCTF${' + digithash + '}';
  	return flag;
}

export async function placeFlag(messagestring, container, image){
	try{
		console.log(image);
		const flag = await getFlagByImage(image);
		if (image.ActiveFlag === 'ubuntu') return; // return if no flag so ubuntu
		const FlagHash = getFlagHash(messagestring, flag.FlagID);
		console.log("The flag is", flag.Name);
		console.log("The file path is", flag.Path);
		const containerInfo = await container.inspect();
		if (!containerInfo.State.Running){
			console.error('Container is not running');
			return;
		}
		const exec = await container.exec({
			Cmd: ['/bin/bash', '-c', `sed -i 's|\\[FLAG\\]|${FlagHash}|g' ${flag.Path}`],
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