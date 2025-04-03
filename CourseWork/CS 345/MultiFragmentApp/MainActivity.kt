//Jordan Latimer
//This program will prompt a user to select from a list of 25 comic books, which after they select one,
// details will be displayed about it. The user will also have the option to rate that comic book

package com.example.pg4
import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentManager
import androidx.viewpager2.adapter.FragmentStateAdapter
import androidx.viewpager2.widget.ViewPager2


class MainActivity : AppCompatActivity() {
    private var mWelcomeMessage: TextView? = null //TextView for welcome message on top
    private var mComics: List<ComicBook>? = null  //List of comic books to be displayed on left side of screen
    private var mViewPager: ViewPager2? = null    //ViewPager used on the right side of screen for comic details
    private var comicListFragment: ComicListFragment? = null
    override fun onCreate (savedInstanceState: Bundle?){     //Creating the main activity
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        supportActionBar?.hide()                    //To hide the actionbar
        mWelcomeMessage = findViewById(R.id.welcome_text)       //'Welcome' Text at the top of the screen
        mWelcomeMessage!!.text = getString(R.string.welcome)
        mComics = ComicBook.getComics()                         //Retrieve the list of comic books
        mViewPager = findViewById(R.id.comic_detail_pager)      //Setting up the pager
        val fm: FragmentManager = supportFragmentManager                //To manage fragments
        mViewPager!!.adapter = object : FragmentStateAdapter(fm, lifecycle) {
            override fun createFragment(position: Int): Fragment {  //Creates a new fragment for the comic at a given position
                val comic = mComics!![position]     //Gets the comic at that position
                return ComicDetailFragment.newInstance(comic.comicID) //And creates the fragment with it's id
            }

            override fun getItemCount(): Int{  //Gets the size of the list
                return mComics!!.size
            }
        }
        val fm2: FragmentManager = supportFragmentManager
        var fragment = fm2.findFragmentById(R.id.fragment_container) as? ComicListFragment
        if(fragment == null){     //Creating a new fragment if it doesn't already exist.
            fragment = ComicListFragment()
            fm.beginTransaction().add(R.id.fragment_container, fragment).commit()   //Switching to new fragment
        }
        comicListFragment = fragment
    }
    fun showComic(comicID: Int) {      //Updates ViewPager to display the details for a given comic
        val comicIndex = mComics!![comicID].comicID
        mViewPager?.currentItem = comicIndex
    }
    fun updateList(){     //updating the list on the left side of the screen
        comicListFragment?.updateAdapter()
    }
}
