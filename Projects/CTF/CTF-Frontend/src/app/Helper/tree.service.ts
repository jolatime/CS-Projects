import { Injectable, InputSignal, Inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TreeService {

  private name: string;
  private contents: string;
  private children: TreeService[];
  private parentnode: TreeService | null;
  private directory: boolean;
  private nodenum: number;

  constructor(@Inject(String) name: string, @Inject(String) contents: string, @Inject(Boolean) directory: boolean, @Inject(Number) nodenum: number, @Inject(TreeService) parentnode: TreeService | null) {
    this.name = name;
    this.contents = contents;
    this.children = [];
    this.parentnode = parentnode;
    this.directory = directory;
    this.nodenum = nodenum;
   }

  // adding a child node to tree
  AddChild(node: TreeService) {
    this.children.push(node);
  }

  // chekc if a child already has the same name
  IsNameTaken(filename: string): boolean {
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
  getNodeByName(name: string, num: number): TreeService | null{
    
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

  // get all the nodes in the tree with the same name
  getNodesSameName(name: string, nodes: TreeService[]): TreeService[] {
    
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

  // delete all children of this node
  DeleteTheChildren() {
    this.children = [];
  }

  // gets

  getDir() : boolean {
    return this.directory;
  }
  getName() : string{
    return this.name;
  }
  getNodeNum() : number {
    return this.nodenum;
  }
  getChildren() : TreeService[] {
    return this.children;
  }
  getParent() : TreeService | null {
    return this.parentnode;
  }

  // sets

  setChildren(newchildren: TreeService[]) {
    this.children = newchildren;
  }
}
