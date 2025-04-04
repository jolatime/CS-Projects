/*
    Alex Miller
    Jordan Latimer

    Functions for Create Image Page
*/

window.onload = () => {
    RefreshFileTree();
}

// node class for file tree
class Node {

    constructor (name, contents, directory, nodenum, parentnode) {
        this.name = name;
        this.contents = contents;
        this.children = [];
        this.parentnode = parentnode;
        this.directory = directory; // bool if this node is a directory
        this.nodenum = nodenum; // ID of the node
    }

    // adding a child node to tree
    AddChild(node) {
        this.children.push(node);
    }

    // Check if a child already has the same name
    IsNameTaken(filename) {

        // check children
        if (this.children.length > 0) {
            for (var i=0; i < this.children.length; i++) {
                let child = this.children[i];

                // check the name
                if (child.name === filename) return true;
            }
        }
        return false;
    }

    // get the node with the correct name and nodenum
    getNodeByName(name, num) {

        // base case
        if (this.name === name && this.nodenum == num) return this;

        // Traverse tree structure
        if (this.children.length > 0) {
            for (var i=0; i < this.children.length; i++) {
                const childResult = this.children[i].getNodeByName(name,num);
                if (childResult !== null && childResult.name === name && childResult.nodenum == num) {
                    return childResult;
                }
            }
        }
        return null;
    }

    // get all nodes in the tree with the same name
    getNodesSameName(name, nodes) {

        // base case
        if (this.name === name) nodes.push(this);

        // check children
        if (this.children.length > 0) {
            for (var i=0; i < this.children.length; i++) {
                this.children[i].getNodesSameName(name,nodes);
            }
        }
        return nodes;
    }

    // delete the parent references to send tree to server
    DeleteParentRef() {
        
        this.parentnode = null;

        if (this.children.length > 0) {
            for (var i=0; i < this.children.length; i++) {
                this.children[i].DeleteParentRef();
            }
        }
    }
};

// check the page for exiting the create image screen
function CheckPage() {
    if (!(window.opener && window.opener !== window)) {
        gotoPage('Modify_Contests.html?email=');
    }
    else {
        self.close();
    }
}

// start the tree
let fileobjects = [];
const root = new Node("Root", "", true, 1, null);

// get the file stuff
function getFile(dir,id) {

    // if through the form
    if (id === 'Butts') {
        let filename = document.getElementById('filename').value;
        let contents = document.getElementById('filecontents').value;
        AddFile(dir,filename,contents);
    }

    // if through the dropbox
    else {
        // get the files and set the files that have been read
        let fileinput = document.getElementById('FileInput');
        let filesread = [];
        let files = fileinput.files;

        // loop through each file
        for (let i=0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.readAsText(file);

            // read each file
            reader.onload = (e) => {
                const filename = file.name;
                const contents = e.target.result;
                let readfile = [filename, contents];
                filesread.push(readfile);
            }
            reader.onerror = (e) => {
                console.log('Error: ',e);
            }

            // once all the files have been read and added
            reader.onloadend = function() {

                // all files are read
                if (filesread.length === files.length) {
                    for (var i=0; i < filesread.length; i++) {
                        let file = filesread[i];
                        fileobjects.push(files[i]);
                        let alerts = AddFile(dir,file[0],file[1]);
                        if (alerts === true) return;
                    }

                    // if error, do not do these lines
                    document.getElementById('FileInput').value = '';
                    RefreshFileTree();
                }
            }
        }
    }
}
// add a file to the tree
function AddFile(dir, filename, contents) {
    
    // filename is empty
    if (filename === '' || filename === undefined || filename === null) {
        alert('Must enter file/folder name');
        return true;
    }

    // get every directory selected
    const items = document.querySelectorAll('.selected-node');
    
    // if nothing is selected
    if (items.length === 0) {
        alert('Must select a directory');
        return true;
    }

    // make sure everything selected is a directory
    for (var i=0; i < items.length; i++) {
        if (items[i].firstChild.textContent.substring(0,4) !== '(D)-') {
            alert('Must select a directory');
            return true;
        }
    }

    // go through every item selected
    for (var i=0; i < items.length; i++) {

        // get the name and num from class list
        let results = getNodeNumFromClass(items[i]);
        const name = results[0];
        let num = results[1];

        // get the node from the name and nodenum that was in the class
        const node = root.getNodeByName(name, num);

        // only directories are allowed
        if (node.directory === false) {
            alert('can only add files/folder to directories marked with (D)');
            return true;
        }

        // determine whether the name is already taken inside the directory
        if (!node.IsNameTaken(filename)) {

            // determine node number for new node
            let nodes = [];
            nodes = root.getNodesSameName(filename, nodes);
            num = nodes.length + 1;

            // determine if adding a file or directory and then add it
            const newFile = new Node(filename, contents, dir, num, node);
            node.AddChild(newFile);
        }
        else {
            alert('A file/folder already has that name');
            return true;
        }
    }

    // clear the fields and refresh the tree
    document.getElementById('filename').value = '';
    document.getElementById('filecontents').value = '';

    // if getting from drop box, do not refresh tree until all files are in
    const fileinput = document.getElementById('FileInput').files;
    if (fileinput.length === 0) RefreshFileTree();
    
}

// refreshed the file tree
function RefreshFileTree() {
    const filetree = document.getElementById('FileTree');
    filetree.innerHTML = '';
    
    // create list and add the root
    const list = document.createElement('ul');

    // go through full tree
    const fulllist = AddListItem(list, root);
    filetree.appendChild(fulllist);

}

// use recursion to go through the tree adding each child
function AddListItem(list, node) {

    // add node to current list
    const nodeitem = document.createElement('li');
    if (node.directory) nodeitem.textContent = '(D)-' + node.name;
    else nodeitem.textContent = node.name;

    // add the name and nodenum to the class list
    nodeitem.classList.add(node.name + node.nodenum);

    nodeitem.addEventListener('click', function(nodeitem) {
        const listitem = nodeitem.target;
        listitem.classList.toggle('selected-node');
    });

    // add to list
    list.appendChild(nodeitem);

    // if node has children
    if (node.children.length > 0) {
        const childlist = document.createElement('ul');
        for (var i=0; i < node.children.length; i++) {
            let child = node.children[i];
            list.appendChild(AddListItem(childlist, child));
        }
    }

    // return the whole list
    return list;
}

// get nodenum from class list
function getNodeNumFromClass(item) {

    // get the class list of the selected item
    const WholeClassList = item.classList;
    const namenum = WholeClassList[0];

    // break up the string into the two parts
    const index = namenum.search(/\d/);
    const name = namenum.substring(0,index);
    let num = namenum.substring(index);

    const results = [name,num];
    return results;
}

// delete a file from the tree
function DeleteFile() {
    
    const items = document.querySelectorAll('.selected-node');
    
    // go through each item selected and remove it from parent
    for (var i=0; i < items.length; i++) {

        // get the name and num from class list
        let results = getNodeNumFromClass(items[i]);
        let name = results[0];
        let num = results[1];

        let node = root.getNodeByName(name,num);

        // if root then delete everything
        if (node.name === 'Root') {
            root.children = [];
            RefreshFileTree();
            return;
        }

        // remove the correct nodes
        const parent = node.parentnode;
        const newchildren = parent.children.filter(child => child.name !== node.name);
        parent.children = newchildren;
    }

    // refresh the tree visual
    RefreshFileTree();
}

// Create the actual Image
function CreateImage() {
    
    const imagename = getImageName();
    if (imagename === true) return;

    root.DeleteParentRef();
    SendTree(imagename);

}

function getImageName() {
    const imgname = document.getElementById('ImageName').value;
    if (imgname === undefined || imgname === null || imgname === '') {
        alert('Must include a name for the image');
        return true;
    }

    // docker states all image names must be lowercase, so have to check for that
    if (/[A-Z]/.test(imgname) === true) {
        alert('Image name must be all lowercase');
        return true;
    }

    // get the current time to add to the name so no images have same name
    let time = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    // get rid of the colons and add the time to the image name
    time = time.replace(/:/g,'');
    return imgname + time;
}

// send the full tree structure to the server side
async function SendTree(imgname) {

    const data = { root: root, imgname: imgname, email: getEmail() };
    
    // create a form data to hold both JSON and the files
    const formdata = new FormData();

    // append each file to the form data with the key files
    for (var i=0; i < fileobjects.length; i++) {
        formdata.append('files', fileobjects[i]);
    }

    formdata.append('data', JSON.stringify(data));
    
    // send the post request
    const res = await fetch('/AddImage', {
        method: 'POST',
        body: formdata
    });

    if (res.ok) {
        CheckPage();
    }
}
