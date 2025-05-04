import { getUsername } from "../server.js"
import { getActiveFlagImage } from "../queries/imageQueries.js"
import Docker from 'dockerode';
// create a new docker
const docker = new Docker();

// creating container
async function CreateContainer(email) {
    console.log('Creating Container for ' + email);
    let username = getUsername(email);
    
    // get the active flag image for that user and use that to create the container
    return getActiveFlagImage(email).then(async (image) => {
        if(image === undefined || image.ActiveFlag === null || image.ActiveFlag === 'ubuntu') {
            return await StartContainer('ubuntu', username, email);
        }
        else
            return await StartContainer(image.ActiveFlag, username, email);
    }).catch((err) => {
        console.error('Error in CreateContainer:', err.message);
    });
}

// Create and Start the container with correct image
async function StartContainer(image, username, email) {

    // create container
    try {
        const container = await docker.createContainer({
            Image: image,
            Cmd: ['/bin/bash'],
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            StdinOnce: false,
            OpenStdin: true,
            Tty: true,
            Detach: false,
            Hostname: username,
            name: username
        });

        // start container
        console.log('starting container', container.id);
        await container.start();
        console.log('+++++ Container started for ' + username + ' with ID: ' + container.id + ' +++++');
        return container;
    } catch (err) {
        if (err.statusCode === 409 || err.statusCode === 404) { // confliction or if container doesn't exist
            return CheckContainer(email);
        }
        else console.error(err);
    }
}

// check if there is a container already created and started with the specific email
export async function CheckContainer(email) {
    try { // remove container if that container already exists
        console.log('Checking container for email:', email);
        const cont = await docker.getContainer(getUsername(email));
        const info = await cont.inspect();
        if(info.State.Running){
            await cont.kill();
            await cont.remove({ force: true});
        }
        return await CreateContainer(email);
    } catch(err) {
        if(err.statusCode === 404) {
            return await CreateContainer(email);
        }
        console.error('Error checking container:', err.message);
    }
};