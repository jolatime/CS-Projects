import con from '../db/dbconnection.js';
import { AdminorUser } from '../server.js';
import { getAdminID } from './adminQueries.js';

export async function getContestByID(contestID){
	return new Promise((resolve, reject) => {
		const query = 'SELECT * FROM Contests WHERE ContestID = ?';
		con.query(query, [contestID], (err, rows) => {
			if(err) {
				console.error(err.message);
				reject(err);
			}
			if(rows.length === 0)
				return reject(new Error('Contest not found'));
			resolve(rows[0]);
		});
	});
}

export async function addContest(Name, AdminID, Desc){
	return new Promise((resolve, reject) => {
		const query = 'INSERT INTO CONTESTS (Name, IsActive, AdminID, Description) VALUES (?,0,?,?)';
		con.query(query, [Name, AdminID, Desc], (err, res) => {
			if(err) reject(err);
			else resolve(res);
		})
	})
}

export async function getActiveContest(adminID){
	return new Promise((res, reject) => {
		const query = 'SELECT * FROM Contests WHERE IsActive = 1 AND AdminID = ?';
		con.query(query, [adminID], (err, rows) => {
			if(err) reject(err);
			else res(rows);
		})
	})
}

export async function endContest(adminID, contestID){
	console.log("ContestID:", contestID);
	return new Promise((resolve, reject) => {
		const query = 'UPDATE Contests SET IsActive = 0 WHERE AdminID = ? AND ContestID = ?';
		con.query(query, [adminID, contestID], (err, result) => {
			if(err) reject(err);
			else {
				console.log("Ended:", result);
				resolve(result);
			}
		});
	});
}

export async function setContestActive(adminID, contestID){
	return new Promise((resolve, reject) => {
		const query = 'UPDATE Contests SET IsActive = 1 WHERE AdminID = ? AND ContestID = ?';
		con.query(query, [adminID, contestID], (err, result) => {
			if (err) reject(err);
			else resolve(result);
		  });
	});
}

export async function deleteContest(contestID){
	return new Promise((resolve, reject) => {
		const query = 'DELETE FROM Contests WHERE ContestID = ?';
		con.query(query, [contestID], (err, result) => {
			if (err) reject(err);
			else resolve(result);
		  });
	});
}

// get the contest ID from the contest name
export async function getContestIDFromName(contestname) {
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
export async function getContestIDFromNameAdminID(email, contestname) {
	console.log("EMAIL:", email);
	console.log("CONTEST:", contestname);
	return getAdminID(email).then((Admin) => {
		return new Promise((resolve,reject) => {
			const query = 'SELECT ContestID FROM Contests WHERE AdminID = ? AND Name = ?';
			con.query(query,[Admin,contestname], (err,row) => {
				if (err) {
					console.error(err.message);
					reject(err);
				}
				resolve(row[0].ContestID);
			});
		})
	});
}

export async function getContestsFromAdminID(AdminID){
	return new Promise((resolve, reject) => {
		const query = 'SELECT * FROM Contests WHERE AdminID = ?';
		con.query(query, [AdminID], (err, result) => {
			if (err) reject(err);
			else resolve(result);
		  });
	});
}