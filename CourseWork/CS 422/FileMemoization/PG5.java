//Jordan Latimer
//This program take in an input file, and reads a line (x y z), it treats each
//line like a dice roll and computes based off x amount of dice, and y amount of sides per die, the ways to roll z.
//Then it prints the results to an output file.
import java.io.*;
import java.math.BigInteger;
import java.util.*;

public class PG5{
    private static final HashMap<String, String> HM = new HashMap<>(); //The HashMap used for memoization
    public static void main(String[] args) throws Exception{  //This method grabs input from the input file and does the required calculations with the use of the DiceRolls() method, and prints the ouput to a PG5.output file
        String line;                                   //Line from the file
        int lines = 1;                                  //What line number it is on in the file, used to display 'Case x:'
        int tmp = 0;                                    //Used as an index in the array below
        int[] nums = new int[3];                        //Array to hold each line's input, it initialized to size 3 because each line is guarunteed to have 3 numbers
        BigInteger ways;                                //BigInt to hold the result from DiceRolls
        BufferedReader sf = new BufferedReader (new FileReader("PG5.in"));    //Buffered Reader to read the input file
        PrintWriter computed = new PrintWriter ("PG5.output");                     //PrintWriter to write to the outputfile
        while ((line = sf.readLine()) != null) {                                    //While there is still data to read from the file
            Scanner scanner = new Scanner(line);                                    //Scanner used to extract the ints from the line
            while(scanner.hasNextInt()){                                            //While there are numbers yet in the line, grab them
                int number = scanner.nextInt();                                     
                //System.out.print(number + " ");
                nums[tmp] = number;                                                 //Putting each number in the line into the array
                tmp++;                                                              //Increment tmp
                if(tmp % 3 == 0){                                                   //If the tmp modulo 3 is 0, then the line is complete, as there are 3 numbers per line
                    ways = DiceRolls(nums[0], nums[1], nums[2]);                    //Compute the line
                    computed.printf ("Case " + lines + ": There are " + ways + " ways to roll a " + nums[2] + "." + "\r\n"); //Writing the result to the output file
                    lines++;                                                        //Incrementing lines to be used in the output 'Case x:'
                    tmp = 0;                                                        //Set tmp back to 0, to rewrite the previous values in the array with the next line's data
                }
            }
            scanner.close();      //Closing scanner/printwriter/bufferedreader
        }
        sf.close();         //Closing Buffered Reader
        computed.close();   //Closing output file
    }

    public static BigInteger DiceRolls(int numDice, int numSides, int target){ //Recursive method that computes how many ways the target can be rolled, with numDice amount of dice, each with numSides amount of sides
        int i = 1;
        //System.out.println(numDice + " " + numSides + " " + target);
        String ans = HM.get(numDice + "," + numSides + "," + target); //First look up the key to see if the answer is already in the HashMap
        BigInteger total = new BigInteger("0");                   
        if(ans == null){                                             //If the answer isn't found in the Hashmap, do the math for it
            if(numDice == 0 && target == 0)                          //Base case, if theres 0 dice and the target at 0, there is one way to roll it
                ans = ""+1;
            else if(numDice == 0 && target != 0 || numDice > 0 && target == 0 || target <= 0)  //Base cases where the answer would return zero, like if the target is 0 and you have dice, and vice versa
                ans = ""+0;
            else{
                while(i <= numSides){       //While i is less than the number of sides, treat i as a die roll, then recursivly compute the ways to get to the new target with less dice
                        total = total.add(DiceRolls(numDice - 1, numSides, target - i));  //Recursively add the results
                        i++;    //Increment i
                }
                ans = total.toString(); //Convert the Big Integer to a string
            }
        }
        HM.put(numDice + "," + numSides + "," + target, ans);  //Place the answer into the Hashmap in case it's needed later
        return new BigInteger(ans);  //Return the answer as a BigInteger
    }
}