import { getImagesForAdmin, DeleteImage, ResetFlagImage} from "../queries/imageQueries.js";
import { getAdminID } from "../queries/adminQueries.js";
import { getAllFlags } from "../queries/flagQueries.js";
import { CreateImage } from "../server.js";
import { Router } from "express";
import exec from 'child_process';
import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = Router();

// create an Image
router.post('/AddImage', upload.array("files"), (req,res) => {
    
    // parse the json data that came in and the files
    const jsondata = req.body.data;
    let parsedjsondata = JSON.parse(jsondata);
    const files = req.files;

    // get all of the values
    const root = parsedjsondata.root;
    const imgname = parsedjsondata.imgname;
    const email = parsedjsondata.email;

    // create image and return
    CreateImage(root, imgname, email, files);
    return res.status(200).json({ success: true });
});

// get all images for Admin
router.post('/getImages', async (req,res) => {
    const { email } = req.body;
    try{
        const Admin = await getAdminID(email);
        const images = await getImagesForAdmin(Admin);
        res.json(images);
    } catch(err){
        console.error("Error getting images:", err.message);
        return res.status(500).json({error: "COULD NOT GET IMAGES"});
    }
});

// delete image and replace the image of the flag that's using it
router.post('/DeleteImageReplaceFlags', (req,res) => {
	const { images } = req.body;
	return getAllFlags().then((flags) => {
		for (var i=0; i < flags.length; i++) {
			// if the flag's image is being deleted change it to ubuntu
			if (flags[i].Image === images) {
				ResetFlagImage(flags[i]);
			}
		}
		// delete the images from the database and from docker
		if (images === 'ubuntu') return res.status(201).json({ success: true });
		else {
			DeleteImage(images);
			try {
				exec.exec(`docker rmi -f ${images}`);
			} catch (err) {
				console.error(err.message);
			}
		}
		return res.status(200).json({ success: true });
	});
});

export default router;