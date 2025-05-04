//Jordan Latimer
//This program will take in a list of words with a given size and print the minimal amount of strings needed to be removed
//so that the data is aphabetical
import java.io.*;
import java.util.HashMap;
import java.util.Scanner;

public class PG6{
    private static final HashMap<String, String> HM = new HashMap<>(); //Hashmap for memoization
    public static void main(String[] args) throws Exception{  //Setting up the BufferedReader/PrintWriter 
        BufferedReader sf = new BufferedReader (new FileReader("PG6.in"));  //To read data from the file
        PrintWriter computed = new PrintWriter ("PG6.output");      //To write to the output file
        getInput(sf, computed);     //Grabs the input from the file and writes it to the output file
    }

    public static void getInput(BufferedReader sf, PrintWriter computed) throws Exception{  //This reads through the input file, creating a string array of the size specified then adding the strings to that array
        String line;                //To hold onto the current line in the file
        String[] strings = null;    //The string array to hold the data
        int i = 0;              //Used to index through the array
        int caseCount = 0;      //To keep track of what case it currently is, used for printing purposes
        int number = 0;         //The number in the input file that specifies how many data entries there will be
        boolean eof = false;    //Check for end of file
        while (!eof) {          //While it isn't the end of file
            line = sf.readLine();               
            Scanner scanner = new Scanner(line); //Creating a scanner to read the line
            if(scanner.hasNextInt()){       //If the next entry is an int
                i = 0;                      //Set the index back to zero, as a new array will be created if the number isn't 0 (end of file)
                number = scanner.nextInt();     //Grab the specified number
                if(number == 0)                 //If it is 0, then the end of the file has been reached
                    eof = true;
                else
                    strings = new String[number];   //Else create the new string array of that grabbed number
            }
            else{
                strings[i] = scanner.nextLine(); //If theres no next int, continue adding the strings to the array
                i++;                //Increment i
            }
            scanner.close(); //Closing scanner
            if(i == number && number != 0){  //If its not the end of file, and if the index (i) is equal to the grabbed number, then all the data from that data set has been grabbed
                HM.clear();                 //Clear the HashMap, as the previous case's data could be in there
                int maxLength = 1;          //Holds on to the max length from ALL strings in the array, it is at least 1
                int tmpLength = 0;          //The variable that holds each string's max length
                caseCount++;                //Increment what case number we're on
                for(int j = 0; j < strings.length; j++){  //Work through each string in the array starting at the first, computing the max length of the subsequence ending in that string. 
                    tmpLength = alphabeticExclusion(strings, j); //Getting that string's max length of the subsequence ending in that string. Passing through the strings array and the index j
                    if(tmpLength > maxLength)  //If a new max Length has been found, update maxLength
                        maxLength = tmpLength;
                }
                computed.printf("Case " + caseCount + ": You only need to remove " + (strings.length - maxLength) + " word(s)!\r\n" ); //Writing to the output file. The correct number to be removed is computed from the length of the array subtracted by the maxLength
                //System.out.println("The number that should be removed: " + (strings.length - maxLength));
            }
        }
        sf.close();
        computed.close();
    }
    //Recursively computes the max length of of a given string by starting at the first string in the array, and tab/////
    public static int alphabeticExclusion(String[] strings, int index){ 
        String ans = HM.get(""+index);  //Checking to see if the key (the index) is in the HashMap
        if(ans == null){    //If the key is not already in the HashMap
            int maxLength = 1;      //Holds onto the max length 
            for(int i = 0; i < index; i++){     //Moving forward through the array, 
                String indexStr = strings[index];   //The string at the index we are checking, it will be compared to each string starting at the first position to see if it would come after it alphabetically. 
                                                    //For each 'successful' check, it will increment the tmpLength and then recurse to the next string, and reset it upon an 'unsuccessful' check
                String pastStr = strings[i];             //The string at index i that will be compared to the index
                if(indexStr.compareTo(pastStr) >= 0){    //If the string at the index we 
                    int tmpLength = alphabeticExclusion(strings, i) + 1;        //Recursively going through the array and incrementing tmpLength for each 'successful' check
                    if(tmpLength > maxLength)   //If the tmpLength is greater than the overall max length for that string, update maxLength
                        maxLength = tmpLength;
                }
            }
            ans = ""+maxLength; //Converting that maxLength to a string to put into the HashMap
            HM.put(""+index, ans); //Set the value in in the Hashmap with the string's index in the array as a key
        }
        return Integer.parseInt(ans); //Return the maxLength
    }
}