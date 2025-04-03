//Jordan Latimer
//This program will ask the user for different comic books and then use shell sort to sort them alphabetically
import java.util.*;
public class PG2 {

 public static void main (String[] args) {
    String comicName;  //for comic name input
    String comicCharacter; //for character input
    int ct = 0;  //counter
    System.out.println("How long would you like the array to be: ");
    Scanner myObj = new Scanner(System.in);    //Scanner to get input from user
    while(!myObj.hasNextInt()){                //Checking to see if the input is not an integer
        System.out.println("Must be an integer!");
        myObj.next();
    }
    int size = myObj.nextInt();                    //Size of the array
    myObj.nextLine();                              //To get to the next line
    comicBook[] comicBooks = new comicBook[size];    //Creating an array of comic books the size of the number inserted, each contain a title and a character name
  while (ct < size){
    System.out.println("Enter comic book " + (ct + 1) + ": ");
    comicName = myObj.nextLine();                                //Getting comic name input
    System.out.println("Enter character " + (ct + 1) + ": ");
    comicCharacter = myObj.nextLine();                           //Getting comic character input
    comicBooks[ct] = new comicBook(comicName, comicCharacter, ct);      //Adds the data to the array of objects
    ct++;                                                          //increments counter
  }
  myObj.close();
  ShellSort(comicBooks);
  for(int i = 0; i < comicBooks.length; i++){       //To print out the array after the sort
    comicBooks[i].print();
  }
 }

 public static void ShellSort (comicBook[] comicBooks) {    //To perform shell sort on the array of objects. Sorts smaller and smaller intervals
    for (int diff=comicBooks.length-1; diff > 0; diff--) {    //Index starts at the end of the array
        int t = diff;
        while (t%2==0) t/=2;    //To get to the next smallest interval
        while (t%3==0) t/=3;
        if (t==1){
            for (int i = diff; i < comicBooks.length; i++){
              int comparison = comicBooks[i - diff].getname().compareTo(comicBooks[i].getname()); //Comparison of the comic book titles
                if (comparison > 0) {     //If there need to be a swap, swap them
                    comicBook ts = comicBooks[i - diff];   //Making a temp object to hold onto the data for the swap
                    comicBooks[i - diff] = comicBooks[i];  //The Swap
                    comicBooks[i] = ts;  //Takes back what the temp variable was holding onto
                }
                else if(comparison == 0){         //If the comic book titles are the same
                  if(comicBooks[i - diff].getIndex() > comicBooks[i].getIndex()){   //If they're not in their original order, swap them
                    comicBook ts = comicBooks[i - diff];
                    comicBooks[i - diff] = comicBooks[i];
                    comicBooks[i] = ts;
                  }
                }
            }
        }
    }
 }
}