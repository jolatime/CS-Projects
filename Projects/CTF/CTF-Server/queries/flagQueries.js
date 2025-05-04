import con from '../db/dbconnection.js';
import { AdminorUser } from '../server.js';

// get a flag by the image name
export async function getFlagByImage(image) {
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

// get all of the flags
export async function getAllFlags() {
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

export async function addFlag(name, desc, contest, image, path, hint1, hint2, hint3){
	return new Promise((resolve, reject) => {
		const query = 'INSERT INTO FLAGS (Name, Description, ContestID, Image, Path, Hint1, Hint2, Hint3) VALUES (?,?,?,?,?,?,?,?)';
		con.query(query, [name, desc, contest, image, path, hint1, hint2, hint3], (err, result) => {
			if(err) reject(err);
			else resolve(result);
		});
	});
}

// delete flags attempts from submissions
export async function DeleteFlagFromSub(flag) {
	const query = 'DELETE FROM Submissions WHERE FlagID = ?';
	con.query(query, [flag], (err) => {
		if (err) {
			console.error(err.message);
		}
	});
}

export async function getActiveFlag(email, table){
	return new Promise((resolve, reject) => {
		const query = `SELECT ActiveFlag FROM ${table} WHERE Email = ?`;
		con.query(query, [email], (err, rows) => {
			if(err) reject(err);
			if(rows.length > 0 && rows[0].ActiveFlag !== null){
				resolve(rows[0].ActiveFlag)
			}
			else reject("no active flag found");
		});
	});
}

export async function setNewActiveFlag(FlagImage, email, table){
	return new Promise((resolve, reject) => {
		const query = `UPDATE ${table} SET ActiveFlag = ? WHERE Email = ?`;
		console.log('New image:', FlagImage);
		con.query(query, [FlagImage, email], (err, result) => {
			if(err) reject(err);
			else resolve(result);
		});
	});
}

export async function clearActiveFlag(email){
	const table = await AdminorUser(email);
	return new Promise((resolve, reject) => {
		const query = `UPDATE ${table} SET ActiveFlag = ? WHERE Email = ?`;
		con.query(query, ['ubuntu', email], (err, result) => {
			if(err) reject(err);
			else resolve(result);
		});
	});
}


export async function deleteFlag(flag){
	return new Promise((resolve, reject) => {
		const query = 'DELETE FROM Flags WHERE FlagID = ?';
		con.query(query, [flag], (err, result) => {
			if(err) reject(err);
			else resolve(result);
		});
	});
}

export async function deleteFlagsFromContest(contest){
	return new Promise((resolve, reject) => {
		const query = 'DELETE FROM Flags WHERE ContestID = ?';
		con.query(query, [contest], (err, result) => {
			if(err) reject(err);
			else resolve(result);
		});
	});
}

// get a flag from a specific contest
export async function getFlagFromContestID(contestID) {
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