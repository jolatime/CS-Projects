import { AdminorUser } from "../server.js";
import { Router } from "express";
import { addFlag, setNewActiveFlag, clearActiveFlag, getFlagFromContestID, deleteFlagsFromContest, DeleteFlagFromSub, deleteFlag, getAllFlags, getFlagByImage, getActiveFlag} from "../queries/flagQueries.js"
const router = Router();
// add a new flag to a specific contest
router.post('/AddFlag', (req,res) => {
	const { name, desc, contest, image, path, hint1, hint2, hint3} = req.body;
	// getting all the hints, whether how many
	let Hint1 = hint1 || '';
	let Hint2 = hint2 || '';
	let Hint3 = hint3 || '';
    console.log("got here");
	addFlag(name, desc, contest, image, path, Hint1, Hint2, Hint3)
	.then(result => {
		return res.status(200).json({success: true, result});
	}).catch(err => {
		console.error(err.message);
		return res.status(500).json({error: "COULD NOT ADD FLAG"});
	});
});

// Set new flag for specific user ActiveFlag
router.post('/setNewActiveFlag', async (req,res) => {
	const { FlagImage, email } = req.body;
	return AdminorUser(email).then((table) => {
		return setNewActiveFlag(FlagImage, email, table)
	}).then(result => {
		console.log('Flag update:', result);
		return res.status(200).json({success: true, result});
	}).catch(err => {
		console.error(err.message);
		return res.status(500).json({error: "COULD NOT SET FLAG ACTIVE"});
	});
});

router.post('/clearActiveFlag', async(req, res) => {
    const {email} = req.body;
    try{
        const result = await clearActiveFlag(email);
        return res.status(200).json({success: true});
    }catch(err){
        console.error("Error clearing flag:", err.message);
        return res.status(500).json({error: "Could not clear active flag"});
    }
});

// delete all flags from a specific contest
router.post('/DeleteFlagsFromContest', async (req,res) => {
    const { contest } = req.body;
    try{
        console.log("Contest:", contest);
        // get all flags first and delete them from submissions
        const flags = await getFlagFromContestID(contest);
        console.log("Flags:", flags);
        for (var i = 0; i < flags.length; i++) 
            await DeleteFlagFromSub(flags[i].FlagID);
        const result = await deleteFlagsFromContest(contest);
        console.log("Result", result);
        if(result.affectedRows === 0)
            return res.status(200).json({ success: true, message: "No flags found for this contest"});
        return res.status(200).json({success: true});
    } catch(err){
        console.error("Error deleting flags from contest:", err.message);
        return res.status(500).json({error: "COULD NOT DELETE FLAGS"});
    }
});

// get every flag inside db
router.get('/getAllFlags', async (req,res) => {
    try{
        const flags = await getAllFlags();
        res.json(flags);
    } catch(err){ res.status(500).json({error: "FAILED TO GRAB FLAGS"})};
});

// delete specific flag with FlagID
router.post('/DeleteFlag', (req,res) => {
	const { flag } = req.body;
	DeleteFlagFromSub(flag);
	deleteFlag(flag).then(result => {
		if(result.affectedRows === 0)
			return res.status(404).json({error: "FLAG NOT FOUNT"});
		return res.status(200).json({success: true});
	}).catch(err => {
		console.error("Error deleting flag:", err.message);
		return res.status(500).json({error: "COULD NOT DELETE FLAG"});
	});
});

// get the active flag of a specific user
router.post('/getActiveFlag', async (req,res) => {
	const { email, contest } = req.body;
    try{
        const table = await AdminorUser(email);
        const activeFlag = await getActiveFlag(email, table);
        if(activeFlag !== null){
            const imageObject = {ActiveFlag: activeFlag};
            const flag = await getFlagByImage(imageObject);
            res.json(flag);
        }
        else res.status(500).json({error: "No active flag found"});
    }catch(err){
        console.error(err.message);
        res.status(500).json({ error: "FAILED TO GET ACTIVE FLAG"});
    }
});

// get every flag for a specific contest
router.post('/getAllFlagsFromContest', async (req,res) => {
	const { contest } = req.body;
	try{
        const flags = await getFlagFromContestID(contest);
        res.json(flags);
    }catch(err) { res.status(500).json({error: "could not grab flags for contest"}); }
});

export default router;