package com.example.pg3

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.activity.ComponentActivity

class ComicSelectionActivity: ComponentActivity() {
    companion object{
        const val COMIC_COMPANY_NAME = "COMIC_COMPANY_NAME" //Getting the variables from the intents
        const val COMIC_BOOK_NAMES = "COMIC_BOOK_NAMES"
    }
    private var companyName: String? = null     //company name
    private var comicBooks: Array<String>? = null  //The array of comic books
    private var myComicTV: TextView? = null        //Text view display
    private var comic1Butt:Button? = null          //The buttons for the company's 5 comics
    private var comic2Butt:Button? = null
    private var comic3Butt:Button? = null
    private var comic4Butt:Button? = null
    private var comic5Butt:Button? = null
    @SuppressLint("SetTextI18n")    //suggested fix for adding to the text view
    override fun onCreate(savedInstanceState: Bundle?){
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_comic_selection)
        companyName = intent.getStringExtra(COMIC_COMPANY_NAME)
        comicBooks = intent.getStringArrayExtra(COMIC_BOOK_NAMES)
        myComicTV = findViewById(R.id.mycomictv)     //Connecting all of these elements to the xml
        comic1Butt = findViewById(R.id.comicbutton1)
        comic2Butt = findViewById(R.id.comicbutton2)
        comic3Butt = findViewById(R.id.comicbutton3)
        comic4Butt = findViewById(R.id.comicbutton4)
        comic5Butt = findViewById(R.id.comicbutton5)
        val buttons = arrayOf(comic1Butt, comic2Butt, comic3Butt, comic4Butt, comic5Butt)  //An array containing all of the buttons
        myComicTV!!.text = getString(R.string.greeting2) + "\n"  //Prompts the user to select one of the comics
        for(i in 0 until comicBooks!!.size){      //Iterates through the all of the comic books from the company. It prints it to the textview, and also creates a button with that info
            myComicTV!!.append(comicBooks!![i] + "\n")  //print outs all the comic options
            buttons[i]!!.text = comicBooks!![i]     //changing the button's text to it's corresponding comic name
            buttons[i]!!.setOnClickListener{          //Creating an onClickListener for each button
                startComicActivity(companyName, comicBooks!![i])  //Calls startComicActivity with the company name, and the comic name of whatever button was selected
            }
        }
    }

    private fun startComicActivity(companyName: String?, selectedComic: String){//This method returns the selected company name and comic back to the main activity
        val data = Intent()
        val i = Intent(this, MainActivity::class.java)
        data.putExtra(COMIC_COMPANY_NAME, companyName)           //company name
        data.putExtra("SELECTED_COMIC", selectedComic)     //selected comic
        setResult(RESULT_OK, data)  //sends the intent back to main activity when activity dies
        finish()     //kills the activity
    }
}