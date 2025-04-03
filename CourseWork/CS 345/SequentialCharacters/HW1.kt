//Jordan Latimer
//This program lets the user make a matrix of their preferred size and it will print out the character that occurs the most frequent linearly
fun main(){
    var mostConsecutive = 0
    var C:Array<Char> = emptyArray()   //An array to hold all of the most consecutive chars, for ties
    var M:Array<Array<Char>> = emptyArray()   //making empty array
    print("How many rows would you like: ")
    var rows = readLine()!!.toInt()
    print("How many collumns would you like: ")   //getting the row and column ammounts
    var cols = readLine()!!.toInt()
    for (i in 1..rows) {
        print("Enter row " + i + ": ")        //For the user to input the contents of the rows
        var line = readLine()
        while(line!!.length != cols){            //If the length of their string doesn't match the number of columns
            print("Your row must be " + cols + " characters! Try again: ") 
            line = readLine()
        }
        M +=  line.toCharArray ().toTypedArray()       //Adding it to the array
    }
    //println("Your Matrix: ")
    var rowsIndex = 0       //The row and cols index is so I can run the frequency method on every character in the 2D array
    for (line in M) {
        var colsIndex = 0;
        for (ch in line){
            //print (ch)
            var tmp = frequency(M, rows, cols, rowsIndex, colsIndex, ch)
            if(tmp > mostConsecutive){        //If a character has the new highest consecutive frequency then it should be the only element in the 'answer' array C
                mostConsecutive = tmp
                C = emptyArray()
                C += ch
            }
            if(tmp == mostConsecutive && !C.contains(ch))   //Keeps track of the other character in case of a tie or it isn't alreay in the 'answers' array
                C += ch
            colsIndex++
        }
        rowsIndex++
    }
    print("The most consecutive linear char is: ")  //prints the answer(s)
    for(ch in C)
        print(ch + " ")
}

fun frequency (M:Array<Array<Char>>, totalrows:Int, totalcols:Int, row:Int, col:Int, symbol:Char):Int{ //Will take a character and check all characters to the right of it, down of it, or diagonal
    var inARow = 0
    var mostInARow = 0
    for(dr in 0..totalrows-1){     //Scans everything below a character
        if(charat(M, row + dr, col) == symbol)   //increments it if there is a streak
            inARow++
        else
            break       //or else breaks out of the loop
    }
    mostInARow = compare(inARow, mostInARow) //Updating the current high if necessary
    inARow = 0           //reseting the count to check in the next direction 
    for(dc in 0..totalcols-1){            //Same thing but for characters to the right of itself
        if(charat(M, row, col + dc) == symbol) 
            inARow++
        else
            break
    }
    mostInARow = compare(inARow, mostInARow)
    inARow = 0
    for(dr in 0..totalrows-1){          //Checking for characters diagonally down right
        for(dc in dr..totalcols-1){     //Increments columns based off rows
            if(charat(M, dr + dc, dc) == symbol){  //For checking the characters down right of it
                inARow++
            }
            else{
                mostInARow = compare(inARow, mostInARow)
                inARow = 0
                break
            }
        }
        mostInARow = compare(inARow, mostInARow)
        break
    }
    mostInARow = compare(inARow, mostInARow)
    for(dr in 0..totalrows-1){              //Checking for characters diagonally down left
            if(charat(M, row + dr, col - dr) == symbol)  //Similar to how the previous diagonal check works, just down and left from the character
                inARow++;
            else
                break
        mostInARow = compare(inARow, mostInARow)
    }
    return mostInARow         //returns the most in a row for that character in all directions
}

fun compare (inARow:Int, mostInARow:Int): Int{  //Helped repetitive code
    if(inARow > mostInARow)
        return inARow
    else
        return mostInARow
}

fun charat (M:Array<Array<Char>>,row:Int,col:Int):Char {      //Returns the Char at a particular location 
    if (row >= 0 && row < M.size && col >=0 && col < M[row].size)
        return M[row][col];
    return '\u0000'
}
