import con from '../db/dbconnection.js';

// get a user from either table with email
export function getUserByEmail(table, email) {
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
export async function getUsersFromAdmin(AdminID) {
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

export async function setUserName(name, email){
	return new Promise((resolve, reject) => {
		const query = 'UPDATE Users SET Name = ? WHERE Email = ?';
		con.query(query, [name, email], (err) => {
			if(err) reject(err);
			else resolve();
		});
	});
}

export async function addStudent(name, email, password, admin){
	return new Promise((resolve, reject) => {
		const query = `INSERT INTO Users (Name, Email, Password, Flags, AdminID) VALUES (?,?,?,0,?)`;
		con.query(query, [name, email, password, admin], (err, result) => {
			if(err) reject(err);
			else resolve(result);
		});
	});
}

export async function updateStudent(email, password){
	return new Promise((resolve, reject) => {
		const query = 'UPDATE Users SET Password = ? WHERE Email = ?';
		con.query(query, [password, email], (err, result) => {
			if(err) reject(err);
			else resolve(result);
		});
	});
}

export async function getUserID(email){
	return new Promise((resolve, reject) => {
		const query = 'SELECT UserID FROM Users WHERE Email = ?';
		con.query(query, [email], (err, result) => {
			if(err) reject(err);
			resolve(result[0].UserID);
		});
	});
}


export async function updateUserFlags(userID) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE Users SET Flags = Flags + 1 WHERE UserID = ?';
        con.query(query, [userID], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

export async function deleteStudent(email) {
    return new Promise((resolve, reject) => {
        const query = "DELETE FROM Users WHERE Email = ?";
        con.query(query, [email], (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}