import { Component } from '@angular/core';
import { TreeService } from '../Helper/tree.service';
import { getEmail, gotoPage } from '../Helper/Helpers';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-image',
  imports: [],
  templateUrl: './create-image.component.html',
  styleUrl: './create-image.component.css'
})
export class CreateImageComponent {
  
  private root: TreeService = new TreeService("Root", "", true, 1, null);
  private allFiles: File[] | null = null;

  constructor(private router: Router) {}

  // initialize
  ngOnInit() : void {

    // create the root and refresh the file tree
    this.RefreshFileTree();
  }

  RefreshFileTree() {

    const filetree = document.getElementById('FileTree') as HTMLUListElement;
    filetree.innerHTML = '';
    
    // create list and add the root
    const list = document.createElement('ul');

    // go through full tree
    const fulllist = this.AddListItem(list, this.root);
    filetree.appendChild(fulllist);

    this.ClearInputs();
  }

  // uploading files through dropbox
  onFileChange(event: any) {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      if (!this.allFiles) this.allFiles = []; // set the array up if it's null
      for (let i=0; i < files.length; i++) {
        this.allFiles?.push(files[i]);

        // add to tree
        if (this.AddFileToTree(files[i], false, "", "")) return;
      }
      // reset files inside dropbox?
      this.RefreshFileTree();
      this.ClearInputs();
    }
  }

  // add the file to the tree
  AddFileToTree(file: File | null, dir: boolean, filename: string, contents: string) : boolean{
    const elements = document.querySelectorAll('.selected-node');

    // make sure a parent node is selected
    if (elements.length == 0) {
      alert('Must select a Directory');
      this.ClearInputs();
      return true;
    }

    // make sure all the nodes selected are directories
    for (let i=0; i < elements.length; i++) {
      let li = elements[i] as HTMLLIElement;
      if (li.firstChild?.textContent?.substring(0,4) !== "(D)-") {
        alert('Must select a directory');
        this.ClearInputs();
        return true;
      }
    }

    // loop through all the elements adding the name of the file to the tree
    for (let i=0; i < elements.length; i++) {

      // get the parent node selected
      let li = elements[i] as HTMLLIElement;
      let results = this.getNodeNumFromClass(li);
      let parentname: string = (results[0]).toString();
      let parentnum: number = Number(results[1]);
      let node = this.root.getNodeByName(parentname,parentnum);
      
      // if the parent node isnt a directory, dont add it
      if (node?.getDir() == false) {
        alert('can only add files/folders to directories');
        this.ClearInputs();
        return true;
      }

      // make sure the filename isnt taken already
      if (!node?.IsNameTaken(filename)) {

        // get the number of nodes of this name for nodenum
        let nodes: TreeService[] = [];
        nodes = this.root.getNodesSameName(filename, nodes);
        let nodenum = nodes.length + 1;

        // add the node to the tree
        if (file == null) { // not using dropbox
          let newFile = new TreeService(filename, contents, dir, nodenum, node);
          node?.AddChild(newFile);
        }
        else { // using dropbox
          let FileObjName : string = file?.name!;
          let newFile = new TreeService(FileObjName, "", false, nodenum, node);
          node?.AddChild(newFile);
        }
        
      }
      else {
        alert('That file name is already under this directory');
        this.ClearInputs();
        return true;
      }
    }
    return false;
  }


  // get the file stuff through creating a new file
  getFile(dir: boolean) {
    let nameElement = document.getElementById('filename') as HTMLInputElement;
    let filename: string = nameElement.value;
    let contentsElement = document.getElementById('filecontents') as HTMLTextAreaElement;
    let contents : string = contentsElement.value;

    if(this.AddFileToTree(null, dir, filename, contents)) return;
    this.RefreshFileTree();
  }


  // use recursion to go through the tree adding each child
  AddListItem(list: HTMLUListElement, node: TreeService) {

    // add node to current list
    const nodeitem = document.createElement('li');
    const spanitem = document.createElement('span');

    if (node.getDir()) spanitem.textContent = '(D)-' + node.getName();
    else spanitem.textContent = node.getName();

    // add the name and nodenum to the class list
    spanitem.classList.add(node.getName() + node.getNodeNum());

    spanitem.addEventListener('click', function(nodeitem) {
        const listitem = nodeitem.target as HTMLLIElement;
        listitem?.classList.toggle('selected-node');
    });

    nodeitem.appendChild(spanitem);
    // add to list
    list.appendChild(nodeitem);

    // if node has children
    if (node.getChildren().length > 0) {
        let nodechildren = node.getChildren();
        const childlist = document.createElement('ul');
        for (var i=0; i < nodechildren.length; i++) {
            let child = nodechildren[i];
            list.appendChild(this.AddListItem(childlist, child));
        }
    }

    // return the whole list
    return list;
  }

  // get nodenum from class list
  getNodeNumFromClass(item : HTMLLIElement) {

    // get the class list of the selected item
    const WholeClassList = item.classList;
    const namenum = WholeClassList[0];

    // break up the string into the two parts
    const index = namenum.search(/\d/);
    const name = namenum.substring(0,index);
    let num : number = Number(namenum.substring(index));

    const results = [name,num];
    return results;
  }

  // delete a file from the tree
  DeleteFile() {
    
    const items = document.querySelectorAll('.selected-node');
    
    // go through each item selected and remove it from parent
    for (var i=0; i < items.length; i++) {

      let li = items[i] as HTMLLIElement;

        // get the name and num from class list
        let results = this.getNodeNumFromClass(li);
        let name : string = results[0].toString();
        let num : number = Number(results[1]);

        let node = this.root.getNodeByName(name,num);

        // if root then delete everything
        if (node?.getName() === 'Root') {
            this.root.DeleteTheChildren();
            this.RefreshFileTree();
            return;
        }

        // remove the correct nodes
        const parent = node?.getParent();
        const newchildren = parent?.getChildren().filter(child => child.getName() !== node?.getName());
        parent?.setChildren(newchildren!);
    }

    // refresh the tree visual
    this.RefreshFileTree();
  }

  // Create the actual Image
  CreateImage() {
    
    const imagename = this.getImageName();
    if (imagename === true) return;

    this.root.DeleteParentRef();
    this.SendTree(imagename);
    gotoPage(this.router, '/modify-contest');
  }

  // get the name of the image and add the time to it
  getImageName() {
    const imgElement = document.getElementById('ImageName') as HTMLInputElement;
    const imgname = imgElement.value;

    // make sure name is included
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
  async SendTree(imgname : string) {

    const data = { 
      root: this.root, imgname: imgname, email: getEmail()
    };

    // create a form data to hold both JSON and the files
    const formdata = new FormData();

    // append each file to the form data with the key files
    this.allFiles?.forEach((file : File) => {
      formdata.append("files", file, file.name);
      console.log(file.name);
    });

    formdata.append('data', JSON.stringify(data));
      
    // send the post request
    const res = await fetch('api/images/AddImage', {
      method: 'POST',
      body: formdata
    });

    if (res.ok) {
      // go back to modify contest
    }
  }

  // clear the input fields after each addition/error
  ClearInputs() {

    // contents of file
    let contentElement = document.getElementById('filecontents') as HTMLTextAreaElement;
    contentElement.value = '';

    // name of file
    let filenameElement = document.getElementById('filename') as HTMLInputElement;
    filenameElement.value = '';

    // file input box
    let fileinputElement = document.getElementById('FileInput') as HTMLInputElement;
    fileinputElement.value = '';
  }

  // go back to Modify Contest
  navtoPageMC() {
    gotoPage(this.router, '/modify-contest');
  }
}
