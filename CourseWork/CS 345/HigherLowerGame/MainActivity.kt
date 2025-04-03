//Jordan Latimer
//This android app will pick a number and ask the user if they think the next number will be
//higher or lower than it. This continues with the next number until the user guesses incorrectly
package com.example.pg2

import android.annotation.SuppressLint //Prompted Suggested Fix that allowed me to use the randomly generated numbers in the textview
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.activity.ComponentActivity
import com.example.pg2.ui.theme.PG2Theme

class MainActivity : ComponentActivity() {
    private var mHigherButton: Button? = null //buttons
    private var mLowerButton: Button? = null
    private var mGuess: TextView? = null             //textview
    private var guesses = 0                  //the streak
    @SuppressLint("SetTextI18n")               //The suggested fix
    override fun onCreate(savedInstanceState: Bundle?) { //set up
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        mHigherButton = findViewById(R.id.higherbutton)
        mLowerButton = findViewById(R.id.lowerbutton)
        mGuess = findViewById(R.id.guess)
        var chosenNumber = (Math.random()*10+1).toInt() //used for the initial comparison
        mGuess!!.text = getString(R.string.Greeting) + chosenNumber.toString()
        mHigherButton!!.setOnClickListener{          //If the user clicks Higher a new number will be generated
            val newChosenNumber = (Math.random()*10+1).toInt()
            if(newChosenNumber >= chosenNumber){          //If the user was correct in their guess, the textview will display accordingly
                mGuess!!.text = getString(R.string.Win) + "\n" + newChosenNumber.toString() + " " + getString(R.string.CompareBigger) + " " + chosenNumber.toString() + "\n" + getString(R.string.Greeting) + " " + newChosenNumber.toString()
                guesses++                                 //The streak continues
                chosenNumber = newChosenNumber            //The user now will have to guess if the next generated number will be higher or lower than the one that was just generated
            }
            else{                                     //If the user clicks Higher but the new number was Lower, the textview will display accordingly
                mGuess!!.text = getString(R.string.Lose) + "\n" + newChosenNumber.toString() + " " + getString(R.string.CompareSmaller) + " " + chosenNumber.toString() + "\n"
                mGuess!!.append(getString(R.string.Streak) + " " + guesses + "\n")     //Will print out their streak
                guesses = 0                           //And the streak will have ended
                chosenNumber = newChosenNumber        //The user can continue to play if they'd like
                mGuess!!.append(" Try again!" + "\n" + getString(R.string.Greeting) + " " + chosenNumber.toString())
            }
        }
        mLowerButton!!.setOnClickListener{            //Very very similar to how the Higher button works, just with the opposite logic, it will check if the new number is lower rather than higher
            val newChosenNumber = (Math.random()*10+1).toInt()
            if(newChosenNumber <= chosenNumber){
                mGuess!!.text = getString(R.string.Win) + "\n" + newChosenNumber.toString() + " " + getString(R.string.CompareSmaller) + " " + chosenNumber.toString() + "\n" + getString(R.string.Greeting) + " " + newChosenNumber.toString()
                guesses++
                chosenNumber = newChosenNumber
            }
            else{
                mGuess!!.text = getString(R.string.Lose) + "\n" + newChosenNumber.toString() + " " + getString(R.string.CompareBigger) + " " + chosenNumber.toString() + "\n"
                mGuess!!.append(getString(R.string.Streak) + " " + guesses + "\n")
                guesses = 0
                chosenNumber = newChosenNumber
                mGuess!!.append(" Try again!" + "\n" + getString(R.string.Greeting) + " " + chosenNumber.toString())
            }
        }
    }
}