//Jordan Latimer
//This file manages the Comic detail fragment on the right side of the screen
package com.example.pg4

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.fragment.app.Fragment

class ComicDetailFragment : Fragment(){
    private var mComic: ComicBook? = null  //The specific Comic Book
    private var mComics = ComicBook.getComics() //The list of comic books
    @SuppressLint("SetTextI18n")
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View?{ //Creating the Fragment
        val view = inflater.inflate(R.layout.fragment_comic_detail, container, false)
        val comicID = arguments?.getInt(EXTRA_COMIC_ID)  //Getting the comicID passed through
        if(comicID != null)                                 //If comicID is not null
            mComic = mComics[comicID]                       //The desired comic is at position comicID, since comicID is 0 based
        val comicNameTextView: TextView = view.findViewById(R.id.comic_name)  //Setting up displays for the comic name,
        val comicCompanyTextView: TextView = view.findViewById(R.id.comic_company)                              //company,
        val comicRatingTextView: TextView = view.findViewById(R.id.comic_rating)                                //rating,
        val comicRatingEditText: EditText = view.findViewById(R.id.edit_rating)                                 //and choosing/confirming a new rating
        val confirmRatingButt: Button = view.findViewById(R.id.confirm_rating)
        comicNameTextView.text = mComic?.comicName       //Set the comic name to the selected comic
        comicCompanyTextView.text = "Published by " + "\r\n" + mComic?.companyName  //Set the comic company based on the selected comic
        comicRatingTextView.text = "Rating: ${mComic?.comicRating}"   //Set the rating to either 0 (default) or with what the user rated it
        confirmRatingButt.setOnClickListener{       //When the confirm rating button is clicked
            val ratingString = comicRatingEditText.text.toString() //Get the input
            if(ratingString.isNotEmpty()){   //If it isn't empty
                val rating = ratingString.toIntOrNull()  //Set it to an int
                if(rating != null && rating in 1..10){   //Check if it's null or 1-10
                    mComic?.comicRating = rating    //Update the rating
                    comicRatingTextView.text = "Rating: $rating"  //Update the display for the rating
                    ComicBook.updateRating(mComic!!, rating)   //Update the rating in the list
                    (activity as? MainActivity)?.updateList()  //update the list to display the new rating
                }
            }
        }
        return view
    }

    companion object{
        private const val EXTRA_COMIC_ID = "comic_id"
        fun newInstance(comicID: Int): ComicDetailFragment{ //Creating a new instance with comicID
            val args = Bundle()
            args.putSerializable(EXTRA_COMIC_ID, comicID) //Passing the comicID through
            val fragment = ComicDetailFragment()
            fragment.arguments = args  //This passes the arguments to the fragment
            return fragment
        }
    }
}
