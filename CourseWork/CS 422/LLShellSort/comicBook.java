//This file contains the comicBook class, it contains a comic book name and a comic book character
public class comicBook {
    private final String name;
    private final String character;
    private final int index;

    public comicBook (String n, String c, int i) { //Constructor
        name = n;
        character = c;
        index = i;
     }

    public String getname(){        //getter 
        return name;
    }

    public String getcharacter(){    //getter
        return character;
    }

    public int getIndex(){           //getter
        return index;
    }

    public void print(){  //Prints out the contents of the object
        System.out.println("Title: " + this.name);
        System.out.println("Character: " + this.character);
        System.out.println();
    }
}
