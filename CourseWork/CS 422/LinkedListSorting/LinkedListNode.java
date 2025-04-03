//Jordan Latimer
//The linked list node class
public class LinkedListNode {  //Each node has a value and a next
    private final String value;  
    private LinkedListNode next;

 public LinkedListNode (String v, LinkedListNode n) { //Constructor
    value = v;
    next = n;
 }

public void removeLast(){   //Removes the last element of the list
    if(next == null || next.getnext() == null)  //If next node is the last node or null, set next as null
        this.setnext(null);
    else
        next.removeLast(); //Else keep going down the list
}

 public void findMiddle(){  
    if(next == null)  //If the string is the only string in the list, its the middle
        System.out.println("The middle string is: " + this.getvalue());
    else if(next.next == null)  //If there are two strings left in the list, they are both the middle
        System.out.println("The middle strings are: " + this.getvalue() + " and " + next.getvalue());
 }

 public LinkedListNode getnext(){  //getter
    return next;
 }

 public void setnext (LinkedListNode lln) {  //setter
    next = lln;
 }

 public String getvalue(){  //getter
    return value;
 }

 public void addsorted (String v){  //Adds a string in the list alphabetically
    if(next == null || next.getvalue().compareTo(v) >= 0){   //If there is no next or the new string comes after this string, but before next, inputs it accordingly
        LinkedListNode tmp = new LinkedListNode (v, next);
        this.setnext(tmp);    //The new node is now this node's next
    }
    else
        next.addsorted(v);  //Keep going down the list until we find where the new list goes alphabetically
 }

 public void print () {  //Prints out the list.
    System.out.println (value);
    if (next != null) next.print();
 }
}
