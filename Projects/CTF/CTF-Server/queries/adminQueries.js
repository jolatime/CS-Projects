import con from '../db/dbconnection.js';

// get the Admin foreign key from User table
export async function getAdminFromUser(email) {
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

// get the Admin Key by email
export async function getAdminID(email) {
	return new Promise((resolve, reject) => {
		const query = 'SELECT AdminID FROM Admins WHERE Email = ?';
		con.query(query, [email], (err,rows) => {
			if (err) {
				console.error(err.message);
				reject(err);
			}
			resolve(rows[0].AdminID);
		});
	});
}

// get the email of the Admin with the AdminID
export async function getEmailFromAdminID(AID) {
	return new Promise((resolve,reject) => {
		const query = 'SELECT Email FROM Admins WHERE AdminID = ?';
		con.query(query, [AID], (err,row) => {
			if (err) {
				console.error(err.message);
				reject(err);
			}
			resolve(row[0].Email);
		});
	});
}