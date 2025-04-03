//Jordan Latimer
//This program will prompt a user to select a company from which they'd like to view comics for, it then opens a new activity where they can actually select a specific comic from the company. This then gets displayed in the main activity
package com.example.pg3
import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.activity.result.contract.ActivityResultContracts
import android.widget.TextView
import androidx.activity.ComponentActivity

class MainActivity : ComponentActivity() {
    private var marvelButt:Button? = null  //Buttons for each of the companies
    private var dcButt:Button? = null      //dc
    private var imageButt:Button? = null        //image comics
    private var darkhorseButt:Button? = null    //darkhorse
    private var idwButt:Button? = null          //idw publishing
    private var myComics: TextView? = null  //Textview to display the greeting message + Selected comic book name once they select one
    private val marvel = ComicCompany("Marvel", arrayOf("Fantastic Four", "Iron Man", "Doctor Strange", "X-Men", "Avengers"))       //These are the comicCompany objects, that hold the company, as well their comics
    private val dc = ComicCompany("DC", arrayOf("Batman", "Superman", "Wonder Woman", "The Flash", "Green Lantern"))                //Making one for each of the companies
    private val image = ComicCompany("Image Comics", arrayOf("Spawn", "Invincible", "Saga", "The Walking Dead", "Deadly Class"))
    private val darkHorse = ComicCompany("Dark Horse Comics", arrayOf("Hell boy", "Sin City", "The Goon", "300", "Umbrella Academy"))
    private val idw = ComicCompany("IDW Publishing", arrayOf("TMNT", "Transformers", "Godzilla", "Star Trek", "G.I. Joe"))
    @SuppressLint("SetTextI18n")
    private val resultLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()){ //for when the activity resumes control
            result ->
        if(result.resultCode == RESULT_OK){  //If the activity terminated normally
            val data: Intent? = result.data
            val companyName = data?.getStringExtra("COMIC_COMPANY_NAME") //get the company name from the intent
            val selectedComic = data?.getStringExtra("SELECTED_COMIC")   //get the selected comic from the intent
            myComics!!.text = getString(R.string.chosen) + " " + selectedComic + " " + getString(R.string.from) + ". " + companyName + "\n" + getString(R.string.goodchoice)
            //to print out the comic selected, who made it, and prompts the user to select another company
        }
    }
    @SuppressLint("SetTextI18n")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        marvelButt = findViewById(R.id.marvelbutton)     //Buttons for marvel, dc, image comics, darkhorse, and idw publishing
        dcButt = findViewById(R.id.dcbutton)
        imageButt = findViewById(R.id.imagebutton)
        darkhorseButt = findViewById(R.id.darkhorsebutton)
        idwButt = findViewById(R.id.idwbutton)
        myComics = findViewById(R.id.myTV)        //The textview
        myComics!!.text = getString(R.string.greeting) + "\n" + //To print out the list of all the companies the user can choose form
                getString(R.string.company1) + "\n" +
                getString(R.string.company2) + "\n" +
                getString(R.string.company3) + "\n" +
                getString(R.string.company4) + "\n" +
                getString(R.string.company5)

        marvelButt!!.setOnClickListener{ startComicActivity (marvel) }  //OnClickListeners for each of the buttons, it passes their respective ComicCompany object to startComicActivity
        dcButt!!.setOnClickListener{ startComicActivity (dc) }
        imageButt!!.setOnClickListener{ startComicActivity (image) }
        darkhorseButt!!.setOnClickListener{ startComicActivity (darkHorse) }
        idwButt!!.setOnClickListener{ startComicActivity (idw) }
    }

    private fun startComicActivity(company: ComicCompany){  //This method passes the Selected Company, and their Comics to the next activity through an intent
        val i = Intent(this, ComicSelectionActivity::class.java)
        i.putExtra("COMIC_COMPANY_NAME", company.companyName)    //passes company name
        i.putExtra("COMIC_BOOK_NAMES", company.comicNames)        //passes comic name
        resultLauncher.launch(i)  //Called because the new activity will return information
    }
}


