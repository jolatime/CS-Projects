import { Router } from "express";
import { getUserByEmail } from '../queries/userQueries.js';
import bcrypt from 'bcrypt';
const router = Router(); //create a router object to handle routes

router.post("/", async (req, res) => {
	const { email, password } = req.body;

	// Admin Login
	let row = await getUserByEmail('Admins', email);
	if (row) {
		const match = await bcrypt.compare(password, row.Password);
		if (match) return res.status(200).json({ redirectTo: '/admin-contest', email: email });
		else return res.status(400).json({ error: 'INVALID CREDENTIALS' });
	}

	// User Login
	row = await getUserByEmail('Users', email);
	if (row) {
		const match = await bcrypt.compare(password, row.Password);
		if (match) return res.status(200).json({ redirectTo: '/user-menu', email: email });
		else return res.status(400).json({ error: 'INVALID CREDENTIALS' });
	}
	else {
		return res.status(500).json({ error: 'SERVER ERROR' });
	}

});

export default router;