//Jordan Latimer
//This program takes in strings from a user and prints out the string(s) that are in the middle alphabetically
import java.util.*;
public class PG1 {

 public static void main (String[] args) {
  LinkedList MyLL = new LinkedList();      //Creates the Linked List
    Scanner myObj = new Scanner(System.in);    //Scanner to get input from user
    System.out.println("Enter a String: ");
  while (true){         //To continuously get input
    String text = myObj.nextLine();
    if(text.isEmpty())    //If they enter an empty string, no need to get more input
      break;
    MyLL.addsorted(text);       //Add what the user inputed into the list alphabetically 
  }
  MyLL.removeFirstAndLast();   //Finds the middle string(s)
 }
}
