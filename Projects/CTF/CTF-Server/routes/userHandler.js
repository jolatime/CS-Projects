import { deleteStudent, updateStudent, addStudent, setUserName, getUsersFromAdmin, getUserByEmail } from "../queries/userQueries.js";
import { getAdminID } from "../queries/adminQueries.js";
import { Router } from "express";
import bcrypt from "bcrypt";
const router = Router();
// add a student to the database
router.post('/AddStudent', async (req,res) => {
    const { name, email, Aemail, password } = req.body;
    try{
        const Admin = await getAdminID(Aemail);
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const result = await addStudent(name, email, hashedPassword, Admin);
        return res.status(200).json({success: true});
    } catch(err){
        console.error("Error adding student", err.message);
        return res.statusMessage(500).json({error: "Could not add student"});
    }
});

// update a student in the database
router.post('/UpdateStudent', async (req,res) => {
    const { email, password } = req.body;
    try{
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const result = await updateStudent(email, hashedPassword);
        if(result.affectedRows === 0)
            return res.status(404).json({error: "Student not found"});
        return res.status(200).json({success: true});
    } catch(err){
        console.error('Error updating student:', err.message);
        return res.status(500).json({error: "Could not update password"});
    }
});

// delete a student from the database
router.post('/DeleteStudent', (req,res) => {
	const {email} = req.body;
    deleteStudent(email).then((result) => {
        if(result.affectedRows === 0)
            return res.status(404).json({error: "NO STUDENT"});
        return res.status(200).json({success: true});
    }).catch((err) => {
        console.error(err.message);
        return res.status(500).json({error: "COULD NOT DELETE STUDENT"});
    });
});

// get all of the users with the same key as admin
router.post('/getAllUsers', (req,res) => {
	const { email } = req.body;
	return getAdminID(email).then((Admin) => {
		return getUsersFromAdmin(Admin).then((users) => {
            if(users.length === 0)
                res.status(404).json({error: "NO ADMIN/USERS FOUND"});
            else
                res.json(users);
        }).catch((err) => {
            console.error(err.message);
            res.status(500).json({error: "COULD NOT FIND USER"});
        });
	}).catch((err) => {
        console.error(err.message);
        res.status(500).json({error: "COULD NOT FIND ADMIN"});
    });
});

// return everything on a user by email
router.post('/getUser', async(req,res) => {
	const { email } = req.body;
	return getUserByEmail('Users',email).then((row) => {
		if (row) res.json(row);
		else return res.status(404).json({ error: 'USER NOT FOUND' });
	})
});

router.post('/getUsername', async(req,res) => {
	const { email } = req.body;
	return getUserByEmail('Users',email).then((row) => {
		if (row) res.json(row.Name);
		else return res.status(404).json({ error: 'USER NOT FOUND' });
	})
});

// set the new name of the user
router.post('/setUserName', async (req,res) => {
	const { name, email } = req.body;
    try{
        await setUserName(name, email);
        res.status(200).json({success: true});
    }catch(err){
        console.error(err.message);
        res.status(500).json({error: err.message});
    }
});

export default router;