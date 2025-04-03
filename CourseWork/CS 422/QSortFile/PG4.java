//Jordan Latimer
//This program Takes in a File name and a desired record length, it then Quick sorts the file in place 
//on the strings of record length size. 

import java.io.FileNotFoundException;  //Suggested 'Quick Fixes' I included to compile
import java.io.IOException;
import java.io.RandomAccessFile;
import java.util.Scanner;

public class PG4{

    private static Scanner in;           //Scanner for user input
    public static void main(String[] args) throws FileNotFoundException, IOException, Exception{
        in = new Scanner (System.in);
        System.out.println("Enter Filename: ");     //Getting user input for File path/name, and the record length;
        String pathname = in.nextLine();
        System.out.println("Enter Record Size: ");
        int reclen = in.nextInt();
        RandomAccessFile rf = new RandomAccessFile(pathname, "rw");    //Open the file in read/write mode
        long length = rf.length();                           // File length
        int numRecords = (int) (length/reclen);              //Number of records in the file
        QuickSort(rf, 0, numRecords - 1, reclen);     // Quicksorts the file, takes the first pos, last pos, and the record length
        rf.close();  //Close the file
    }

    public static String RecordNum (RandomAccessFile rf,int pos,int reclen) throws Exception { //Returns the string from a given position
        rf.seek (pos*reclen);
        byte[] ba = new byte[reclen];
        rf.read (ba);
        return new String (ba);
    }

    public static void QuickSort(RandomAccessFile rf, int first, int last, int reclen) throws Exception {
        if(first < last){
            int p = (int)(first+Math.random()*(last-first+1));   //Random pivot position
            String piv = RecordNum(rf, p, reclen);                  //The string at p's random position
            overwrite(rf, RecordNum(rf, last, reclen), p, reclen);  //Overwrite the string at the ranom pivot's position with the record in the last position
            int i = first - 1;
            for(int j = first; j <= last-1; j++){
                int c = RecordNum(rf, j, reclen).compareTo(piv);  //Comparing the record with the pivot
                if(c < 0 || c==0 && (int)(2*Math.random())==0){  //Swap if the record is less than the pivot, and sometimes if it's eqaul
                    i++;
                    swap(rf, i, j, reclen);                        //Making the swap
                }
            }
            overwrite(rf, RecordNum(rf, i+1, reclen), last, reclen); //Overwrite the last record with the one at i+1
            overwrite(rf, piv, i+1, reclen);        //Place pivot in its sorted position
            QuickSort(rf, first, i, reclen);        //Recursive call on the first part of the list
            QuickSort(rf, i+2, last, reclen);       //Recursive call on the last part of the list
        }
    }

    public static void swap(RandomAccessFile rf, int pos1, int pos2, int reclen) throws Exception {
        rf.seek(pos1*reclen);                //Seeking to first record's position
        byte[] record1 = new byte[reclen];   //Creating new byte array to read it
        rf.read(record1);                    //Reading the first record
        rf.seek(pos2*reclen);                //Seeking to second record's position
        byte[] record2 = new byte[reclen];   //Creating new byte array to read it
        rf.read(record2);                    //Reading the second record
        rf.seek(pos1*reclen);                //Seek back to the first record's position
        rf.write(record2);                   //Write the second record where the first record was
        rf.seek(pos2*reclen);                //Seek back to the second record's position
        rf.write(record1);                   //Write the original first record where the second one originally was
    }

    public static void overwrite(RandomAccessFile rf, String record, int pos, int reclen) throws Exception{ //Overwrites a string at position pos with the string record
        byte[] record1 = record.getBytes();  //Converting the string to an array of bytes
        rf.seek(pos*reclen);                 //Seeking to the position you want to overwrite
        rf.write(record1);                   //Overwrite that record with the desired string
    }
}