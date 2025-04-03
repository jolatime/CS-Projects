//Jordan Latimer
//Linked List Class
public class LinkedList {
    private LinkedListNode head;

 public LinkedList () {
    head = null;
 }

 public void addtofront (String v) {   //Adds a string to the beginning of the list
    head = new LinkedListNode (v,head);
 }

    public void addsorted (String v) { //Adds a string to the list alphabetically
        if (head == null)    //If theres no head, just add it to the front
            addtofront (v);
        else if(v.compareTo(head.getvalue()) < 0){  //If the new string comes before the head alphabetically, just add it to the beginning of the list
            addtofront (v);
        } 
            
        else    //Else traverse the list finding where the new string goes
            head.addsorted(v);
    }

    public void removeFirstAndLast() { //Continuously removes the first and last elements of the list until the middle ones are left
        if (head == null || head.getnext() == null || head.getnext().getnext() == null) {  //If there is 1 or 2 strings in the list, those are the middle
            if (head != null) {  //As long as theres at least one string in the list 
                head.findMiddle();
            }
            return;
        }
        head = head.getnext(); //set the head as its next, effectivley removing it
        head.removeLast();  //removes the last element in the list
        removeFirstAndLast();  //Recurses and removes more elements if needed
    }
}
