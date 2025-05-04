import { getContestsFromAdminID, addContest, getActiveContest, endContest, setContestActive, deleteContest, getContestByID } from "../queries/contestQueries.js";
import { AdminorUser } from "../server.js";
import {getAdminID, getAdminFromUser, getEmailFromAdminID} from "../queries/adminQueries.js";
import { Router } from "express";
const router = Router();

// add a contest to the database
router.post('/AddContest', async (req,res) => {
    try{
        const { Name, IsActive, email, Desc } = req.body;
        const Admin = await getAdminID(email);
        console.log("Admin is:", Admin);
        await addContest(Name, Admin, Desc)
        res.status(200).json({success: true});
    } catch(err){
        console.error(err.message);
        res.status(500).json({error: "Could not insert contest"})
    }
});

// end a current active contest
router.post('/EndContest', async (req,res) => {
	try{
		const { contest, email } = req.body;
		const Admin = await getAdminID(email);
		console.log("ADMIN ID:", Admin);
		if(!Admin) return res.status(404).json({error: "admin not found"});
		const activeContest = await getActiveContest(Admin);
		if(activeContest.length === 0)
			return res.status(404).json({error: "CONTEST NOT FOUND"});
		if(activeContest.IsActive === 0)
			return res.status(400).json({ error: 'CONTEST ALREADY INACTIVE' });
		const result = await endContest(Admin, contest);
		if(result.affectedRows === 0)
			return res.status(404).json({error: "CONTEST NOT FOUND"});
		return res.status(200).json({success: true});
	} catch(err){
		console.error(err.message);
		return res.status(500).json({error: "ENDING CONTEST"});
	}
});

// Set a specific contest active for a specific Admin
router.post('/setContestActive', async (req,res) => {
	try{
		const { contest, email } = req.body;
		const Admin = await getAdminID(email);
		const activeContest = await getActiveContest(Admin);
		console.log("Active contests", activeContest);
		if(activeContest.length > 0)
			await endContest(Admin, activeContest[0].ContestID);
		const result = await setContestActive(Admin, contest);
		if(result.affectedRows === 0) return res.status(404).json({ error: "CONTEST NOT FOUND"});
		return res.status(200).json({success: true}); 
	} catch(err){
		console.error(err.message);
		return res.status(500).json({error: "Error setting contest active"});
	}
});

// delete a specific contest from database
router.post('/DeleteContest', async (req,res) => {
	try{
		const { contest } = req.body;
		const result = await deleteContest(contest);
		if(result.affectedRows === 0){
			return res.status(404).json({error: "CONTEST NOT FOUND"});
		}
		return res.status(200).json({success: true});
	} catch(err){
		console.error(err.message);
		return res.status(500).json({ error: "ERROR DELETING CONTEST"});
	}
});

// get all contests for specific Admin
router.post('/getContests', async (req,res) => {
	const { email } = req.body;
	try{
		let AdminID;
		const table = await AdminorUser(email);
		if(table == 'Users'){
			const admin = await getAdminFromUser(email);
			AdminID = admin.AdminID;
		}
		else{
			AdminID = await getAdminID(email);
		}
		const contests = await getContestsFromAdminID(AdminID);
		if(contests.length === 0){
			return res.status(404).json({error: "NO CONTESTS FOUND"});
		}
		return res.json(contests);
	} catch(err){
		console.error(err);
		return res.status(500).json({error: "COULD NOT GET CONTESTS"});
	}
});

router.post('/getContestByID', async (req, res) => {
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

router.post('/getActiveContest', async (req, res) => {
	const { email } = req.body;
	try {
		const table = await AdminorUser(email);
		let AdminID;
		if (table === 'Users') {
			const admin = await getAdminFromUser(email);
			AdminID = admin.AdminID;
		} else {
			AdminID = await getAdminID(email);
		}
		const contests = await getActiveContest(AdminID);
		if (contests.length === 0) {
			return res.status(200).json({ message: 'No active contests found' });
		}
		res.json(contests[0]);
	} catch (err) {
		console.error(err.message);
		return res.status(500).json({ error: 'An error occurred while fetching the active contest' });
	}
});

// get the Admin email whether Admin or User
router.post('/getAdminEmail', async (req,res) => {
	const { email } = req.body;
	let AdminEmail = '';
	try {
		const table = await AdminorUser(email);
		if (table === 'Users') {
			let Admin = await getAdminFromUser(email);
			const AdminID = Admin.AdminID;
			AdminEmail = await getEmailFromAdminID(AdminID);
			res.json(AdminEmail);
		}
		else {
			res.json(email);
		}
	}
	catch (err) {
		console.error(err.message);
		return res.status(500).json({ error: 'error getting email' });
	}
})

export default router;
