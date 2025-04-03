//Jordan Latimer
//This is a fragment for the list of comic books
package com.example.pg4
import android.annotation.SuppressLint
import android.view.LayoutInflater
import androidx.fragment.app.Fragment
import android.os.Bundle
import android.view.ViewGroup
import android.view.View
import android.widget.TextView
import androidx.recyclerview.widget.DividerItemDecoration
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class ComicListFragment : Fragment() {
    private var mComicRecyclerView: RecyclerView? = null  //RecyclerView
    private var mAdapter: ComicAdapter? = null              //Adapter

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        val view = inflater.inflate(R.layout.fragment_comic_list, container, false)
        mComicRecyclerView = view.findViewById(R.id.comic_recycler_view)    //Setting up the Recycler View
        mComicRecyclerView!!.layoutManager = LinearLayoutManager(activity)
        val divider = DividerItemDecoration(context, DividerItemDecoration.VERTICAL)   //Adding dividers between each entry in the list
        mComicRecyclerView!!.addItemDecoration(divider)
        mAdapter = ComicAdapter(ComicBook.getComics())              //Setting up the adapter with the comic book list
        mComicRecyclerView!!.adapter = mAdapter
        return view
    }

    private inner class ComicHolder(itemView: View) : RecyclerView.ViewHolder(itemView), View.OnClickListener {
        private val mComicNameTextView: TextView? = itemView.findViewById(R.id.comic_info)       //For comic info to be displayed
        private var comic: ComicBook? = null

        init {
            itemView.setOnClickListener(this)    //On click listener for displaying the extra information
        }

        @SuppressLint("SetTextI18n")
        fun bindComic(comic: ComicBook?) { //Bind the comic view to an actual comic
            this.comic = comic
            mComicNameTextView!!.text = comic!!.comicName + "\r\n" + " Rating: ${comic.comicRating}" //Displays the comic name + rating in the list
        }

        override fun onClick(v: View) { //When a comic is clicked
            val comicID = comic?.comicID  //Grab it's comic id
            if(comicID != null){
                (activity as MainActivity).showComic(comicID)  //If it isn't null, show the comic
            }
        }
    }

    private inner class ComicAdapter(private val mComicBooks: MutableList<ComicBook>) : RecyclerView.Adapter<ComicHolder>(){

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ComicHolder {
            val view = LayoutInflater.from(activity).inflate(R.layout.comic_list_item, parent, false)
            return ComicHolder(view)
        }
        override fun onBindViewHolder(holder: ComicHolder, position: Int) { //To load the comic when it scrolls into view in the recyclerview
            val comic = mComicBooks[position]
            holder.bindComic(comic)
        }
        override fun getItemCount(): Int {  //Returns the size of the comic list
            return mComicBooks.size
        }
    }

    fun updateAdapter(){  //Updates the adapter for display
        mAdapter = ComicAdapter(ComicBook.getComics())  //Grab the new list, with updated ratings
        mComicRecyclerView?.adapter = mAdapter
    }
}
