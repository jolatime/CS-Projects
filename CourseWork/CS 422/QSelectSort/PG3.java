//Jordan Latimer
//This Program takes input for a list of students and their class average.
//It will then ask for what first m elements the user wants sorted, as well as the last n elements.
//The desired portions are then sorted and printed out
import java.util.*;
public class PG3{
    public static void main(String[] args) {
        String studentName;
        double studentAverage;
        int firstPart;               //First m elements to be sorted
        int lastPart;                //Last n elements to be sorted
        int ct = 0;
        System.out.println("How many records are in your list? ");
        Scanner myObj = new Scanner(System.in);    //Scanner to get input from user
        while(!myObj.hasNextInt()){                //Checking to see if the input is not an integer
            System.out.println("Must be an integer!");
            myObj.next();
        }
        int size = myObj.nextInt();
        myObj.nextLine();
        studentRecord[] studentRecords = new studentRecord[size];  //Creates a new array of objects of the desired size
        while (ct < size){                                         //For the array size, get a name and average for each student
            System.out.println("Please enter the name of student " + (ct + 1) + ": ");
            studentName = myObj.nextLine();                                      //Student name
            System.out.println("Please enter the average " + (ct + 1) + ": ");
            studentAverage = myObj.nextDouble();                                 //Student average
            myObj.nextLine();
            studentRecords[ct] = new studentRecord(studentName, studentAverage);    //Creates a new object at the index with the data taken from user
            ct++;                                                          
        }
        System.out.println("How many from the first part of the list? ");
        firstPart = myObj.nextInt();                                           //First m elements to be sorted
        System.out.println("How many from the last part of the list? ");
        lastPart = myObj.nextInt();                                            //Last n elements to be sorted
        myObj.close();
        int newFirstPart = QuickSelect(studentRecords, firstPart, 0);   //Runs QSelect to get the first m elements to the beginning unsorted, then sorts them using QSort.  
        int newLastPart = QuickSelect(studentRecords, lastPart, 1);    //Same as above, but with the last n elements
        System.out.println("FIRST PART:");
        for(int i = 0; i <= newFirstPart; i++)        //print out the first m elements that are now sorted
            studentRecords[i].print();
        System.out.println("LAST PART:");
        for(int i = studentRecords.length - newLastPart; i < studentRecords.length; i++)   //print out the last n elements that are now sorted
            studentRecords[i].print();
    }

    public static int QuickSelect (studentRecord[] studentRecords, int des, int part) { //First gets the first/last m/n elements to their respective portion of the array, then sorts them
        int length = studentRecords.length;                    //The length of the array
        boolean checked = true;                                //boolean check used for later
        if(part == 0){       //For the first m elements
            des = des - 1;                           //The index of des
            QSelect(studentRecords, 0, length - 1, des);  //Do an initial QSelect, to get the des-th element into the correct position, any averages greater than it's will be to the left of it
            do {   
                des = getTies(studentRecords, des, 0);    //Incremenets des based off any sequential ties to the right of des
                if(des + 1 < studentRecords.length)       //If its not the end of the array
                    QSelect(studentRecords, des + 1, length - 1, des + 1);    //QSelect the element after des to put it in it's place
                if(des + 1 >= studentRecords.length || studentRecords[des].getAverage() != studentRecords[des + 1].getAverage())  //If it's at the end of the array or the element placed by QSelect's average isn't equal to des's
                    checked = false;  //Break out of the loop, any potential ties have been found
                else
                    des++;  //Otherwise increment des and do the necessary checks again
            } while (checked);
            QSort(studentRecords, 0, des); //sort the new set of first m elemets
            return des;
        }
        else{                                           //For the last n elements, similar logic to the first m elements
            des = length - des;                         //index of des
            QSelect(studentRecords, 0, length - 1, des); //Do an initial QSelect, to get the des-th element into the correct position, any averages less than it's will be to the right of it
            do { 
                des = getTies(studentRecords, des, 1);  //Update des to reflect any sequential ties the left of it
                if(des - 1 >= 0)                        //If it's not the beginning of the array
                    QSelect(studentRecords, 0, des - 1, des);  //Put the element to the left of des in the correct position
                if(des - 1 < 0 || studentRecords[des].getAverage() != studentRecords[des - 1].getAverage())  //If that newly placed element's average isn't equal to des's or we're at the beginning of the array
                    checked = false;  //Break the loop, any potential ties have been found
                des--;                  //Otherwise decremenet des and do the necessary checks again
            } while (checked);
            QSort(studentRecords, des + 1, length - 1);        //sort the new set of last n elements
            return length - 1 - des;         //return the correct index by subtracting it from the length    
        }
    }
      
    public static void QSort (studentRecord[] studentRecords, int first, int last) {  //Sorts elements in a given range
        if (first < last) {
            int p = QPartition (studentRecords,first,last);
            QSort (studentRecords,first,p-1); //Sorts from the start of the range to the pivot
            QSort (studentRecords,p+1,last);  //Sorts from the pivot to the end of the range
        }
    }
    
    public static int QPartition (studentRecord[] studentRecords, int first, int last) {
        int p = (int)(first+Math.random()*(last-first+1));   //random pivot
        studentRecord piv = new studentRecord(studentRecords[p].getName(), studentRecords[p].getAverage());   //pivot object
        studentRecords[p] = studentRecords[last];
        studentRecord tmp;    //tmp object for swapping
        int i = first-1;
        for (int j = first; j <= last-1; j++) {
            double aavg = studentRecords[j].getAverage();   //Averages for comparison
            double bavg = piv.getAverage();
            String aname = studentRecords[j].getName();     //Names for comparison
            String bname = piv.getName();
            if (aavg > bavg || (aavg==bavg && aname.compareTo(bname) < 0)) {   //Normal swap based off average comparison. But if 2 people have the same average, sort them based off their names alphabetically
                i++; tmp = studentRecords[i]; studentRecords[i] = studentRecords[j]; studentRecords[j] = tmp;
            }
        }
        studentRecords[last] = studentRecords[i+1];
        studentRecords[i+1] = piv;
        return i+1;
    }

    public static void QSelect (studentRecord[] studentRecords, int first, int last, int des) {  //For position des, finds the element that would be at that position if the array were sorted
        if (first < last) {
            int p = QPartition (studentRecords,first,last);
            if (p > des) QSelect (studentRecords,first,p-1,des);   //pivot is too large, focus on left side
            else if (p < des) QSelect (studentRecords,p+1,last,des); //pivot is too small, focus on right side
        }
    }

    public static int getTies(studentRecord[] studentRecords, int des, int part){  //For finding sequential ties, part is 0 for traversing right, and 1 for left
        if(part == 0){                                      
            while(des < studentRecords.length - 1 && studentRecords[des + 1].getAverage() == studentRecords[des].getAverage())
                des++;  //If it's not at the end of the array, and the next element's average is equal to des's, increment des
        }
        else{
            while(des > 0 && studentRecords[des].getAverage() == studentRecords[des - 1].getAverage())
                des--; //If it's not at the start of the array, and the previous element's average is equal to des's, decrement des
        }
        return des;   //Return the new des
    }
}