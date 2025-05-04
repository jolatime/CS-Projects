import con from "../db/dbconnection.js";

export async function getImagesForAdmin(adminID){
    return new Promise((resolve, reject) => {
		console.log("Checking for Admin: ", adminID);
        const query = 'SELECT Name FROM Images WHERE AdminID = ?';
        con.query(query, [adminID], (err, result) => {;
            if(err) reject(err);
            else {
				resolve(result);
			}
        });
    });
}

// get the active flag from specific user
export async function getActiveFlagImage(email) {
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

// add the image name to the db of images
export async function AddImage(Admin,imgname) {
	const query = 'INSERT INTO Images (Name,AdminID) VALUES (?,?)';
	con.query(query, [imgname,Admin], (err) => {
		if (err) {
			console.error(err.message);
		}
	})
}

// reset the flag to ubuntu image
export async function ResetFlagImage(flag) {
	const query = 'UPDATE Flags SET Image = ? WHERE FlagID = ?';
	con.query(query, ['ubuntu', flag.FlagID], (err) => {
		if (err) {
			console.error(err.message);
		}
	});
}

// delete an image from the database
export async function DeleteImage(image) {
	const query = 'DELETE FROM Images WHERE Name = ?';
	con.query(query, [image], (err) => {
		if (err) {
			console.error(err.message);
		}
	});
}