import { Router } from "express";
import { getFlagHash } from "../server.js"
import { getUserID } from "../queries/userQueries.js";
import { getSubmissions, insertSubmission, updateSubmissionAttempts, getAllSubs, getUserSubmissions, DeleteSubsFromStudent} from "../queries/submissionQueries.js";
import { updateUserFlags } from "../queries/userQueries.js";
const router = Router();

router.post('/checkFlagSubmission', async (req, res) => {
	const { email, flagID, submittedFlag } = req.body;
	try{
		const correctFlag = getFlagHash(email, flagID);
		const userID = await getUserID(email);
		
		const submissions = await getSubmissions(userID, flagID);
		if(submittedFlag === correctFlag){
			if(submissions.length === 0){ //If the submission is correct and it is their first submission.
				await insertSubmission(userID, flagID, 1, 1);
				await updateUserFlags(userID);
				return res.json({correct: true, message: "Correct flag submitted!"});
			}
			else{			 //If the submission is correct and it is not their first submission
				await updateSubmissionAttempts(userID, flagID);   
				await updateUserFlags(userID);
				return res.json({correct: true, message: "Correct flag submitted!"});
			}
		}
		else{
			if(submissions.length === 0){    //If the submission is incorrect and it is their first submssion
				await insertSubmission(userID, flagID, 0, 1);
				return res.json({correct: false, message: "Incorrect flag. Try again!"});
			}
			else{      //If their submission is incorrect and it is not their first submission
				await updateSubmissionAttempts(userID, flagID);
				return res.json({correct: false, message: "Incorrect flag. Try again!"});
			}
		}
	} catch(err){
		console.error("Could not add submission:", err);
		return res.status(500).json({correct: false, message: "ERROR SUBMITTING FLAG"});
	}
});

// delete all submissions from a specific user
router.post('/DeleteSubsFromStudent', async (req,res) => {
	const { email } = req.body;
	try{
		const studentID = await getUserID(email);
		const result = await DeleteSubsFromStudent(studentID);
		if(result.affectedRows === 0)
			return res.status(200).json({ success: true, message: "User had no submissions"});
		return res.status(200).json({success: true});
	} catch(err){
		console.error("Error deleting submissions from student:", err.message);
		return res.status(500).json({error: "COULD NOT DELETE Submissions"});
	}
});

router.post('/checkPracSubmission', async (req, res) => {
	const { email, flagID, submittedFlag } = req.body;
	const correctFlag = getFlagHash(email, flagID);
	if(correctFlag === submittedFlag)
		return res.json({correct: true, message: 'Correct flag submitted!'});
	else
		return res.json({correct: false, message: 'Incorrect flag. Try Again'});
});

// getting all submissions
router.post('/getSubs', async (req,res) => {
	let subs = await getAllSubs();
	res.json(subs);
});

export default router;