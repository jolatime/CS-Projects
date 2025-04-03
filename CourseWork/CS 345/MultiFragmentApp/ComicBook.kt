//Jordan Latimer
//This file is the Comic Book Class. It is responsible for setting up the list, as well as updating it

package com.example.pg4

import java.io.Serializable

class ComicBook(company: String, comic: String, rating: Int, id: Int) : Serializable{ //Class of Comic Books
    val companyName = company
    val comicName = comic
    var comicRating = rating
    val comicID = id

    companion object {
        private val comicList: MutableList<ComicBook> = mutableListOf(  //Setting up the list of comicBooks, rating is set to 0 by default, and their id reflects their index in the list
            ComicBook("Marvel", "Fantastic Four", 0, 0),
            ComicBook("Marvel", "Iron Man", 0, 1),
            ComicBook("Marvel", "Doctor Strange", 0, 2),
            ComicBook("Marvel", "X-Men", 0, 3),
            ComicBook("Marvel", "Avengers", 0, 4),
            ComicBook("DC", "Batman", 0, 5),
            ComicBook("DC", "Superman", 0, 6),
            ComicBook("DC", "Wonder Woman", 0, 7),
            ComicBook("DC", "The Flash", 0, 8),
            ComicBook("DC", "Green Lantern", 0, 9),
            ComicBook("Image Comics", "Spawn", 0, 10),
            ComicBook("Image Comics", "Invincible", 0, 11),
            ComicBook("Image Comics", "Saga", 0, 12),
            ComicBook("Image Comics", "The Walking Dead", 0, 13),
            ComicBook("Image Comics", "Deadly Class", 0, 14),
            ComicBook("Dark Horse Comics", "Hell boy", 0, 15),
            ComicBook("Dark Horse Comics", "Sin City", 0, 16),
            ComicBook("Dark Horse Comics", "The Goon", 0, 17),
            ComicBook("Dark Horse Comics", "300", 0, 18),
            ComicBook("Dark Horse Comics", "Umbrella Academy", 0, 19),
            ComicBook("IDW Publishing", "TMNT", 0, 20),
            ComicBook("IDW Publishing", "Transformers", 0, 21),
            ComicBook("IDW Publishing", "Godzilla", 0, 22),
            ComicBook("IDW Publishing", "Star Trek", 0, 23),
            ComicBook("IDW Publishing", "G.I. Joe", 0, 24)
        )
        fun getComics(): MutableList<ComicBook>{  //Getter for the list
            return comicList
        }

        fun updateRating(comic: ComicBook, newRating: Int){ //Updates the rating of the comic with what the user inputs
            comic.comicRating = newRating
        }
    }
}
