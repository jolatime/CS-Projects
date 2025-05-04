import con from "../db/dbconnection.js";

export async function getSubmissions(userID, flagID){
	return new Promise((resolve, reject) => {
		const query = 'SELECT * FROM Submissions WHERE UserID = ? AND FlagID = ?';
		con.query(query, [userID, flagID], (err, result) => {
			if(err) reject(err);
			else resolve(result);
		});
	});
}

export async function getUserSubmissions(userID){
	return new Promise((resolve, reject) => {
		const query = 'SELECT * FROM Submissions WHERE UserID = ?';
		con.query(query, [userID], (err, result) => {
			if(err) reject(err);
			else resolve(result);
		});
	});
}

export async function insertSubmission(userID, flagID, isCorrect, attempts){
	return new Promise((resolve, reject) => {
		const query = 'INSERT INTO Submissions (UserID, FlagID, IsCorrect, Attempts) VALUES (?, ?, ?, ?)';
		con.query(query, [userID, flagID, isCorrect, attempts], (err, result) => {
			if(err) reject(err);
			else resolve(result);
		});
	});
}

export async function updateSubmissionCorrect(userID, flagID){
	return new Promise((resolve, reject) => {
		const query = 'UPDATE Submissions SET IsCorrect = 1 WHERE UserID = ? AND FlagID = ?';
		con.query(query, [userID, flagID], (err, result) => {
			if(err) reject(err);
			else resolve();
		});
	});
}

export async function updateSubmissionAttempts(userID, flagID){
	return new Promise((resolve, reject) => {
		const query = 'UPDATE Submissions SET Attempts = Attempts + 1 WHERE UserID = ? AND FlagID = ?';
		con.query(query, [userID, flagID], (err, result) => {
			if(err) reject(err);
			else resolve();
		});
	});
}

// delete flags attempts from submissions
export async function DeleteSubsFromStudent(userID) {
	return new Promise((resolve, reject) => {
		const query = 'DELETE FROM Submissions WHERE UserID = ?';
		con.query(query, [userID], (err, result) => {
			if (err) {
				console.error(err.message);
				return reject(err);
			}
			resolve(result);
		});
	});
}

// get all of the submissions
export async function getAllSubs() {
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