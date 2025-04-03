//Jordan Latimer
//Uses a purposeful convoluded way of computing pi using threads
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.concurrent.ThreadLocalRandom;

public class JavaPi{
   public static void main (String [] args) throws Exception{
    System.out.println("How many Threads would you like to create?");
    InputStreamReader read = new InputStreamReader(System.in);
    BufferedReader in = new BufferedReader(read);
    int number = Integer.parseInt(in.readLine());   //Getting user input (From an old project)
    System.out.println(number);
    myThread Thread[] = new myThread[number];  //Creating an array of Threads
    for(int i = 0; i < number; i++){
        Thread[i] = new myThread();
        Thread[i].threadCt = number;        //Creates as many Threads as desired
        Thread[i].start();
    }
    for(int i = 0; i < number; i++)
        try{
          Thread[i].join ();
        }
      catch (InterruptedException e){
        System.exit(0);
      }  

      double pi = 0;
      for(int i = 0; i < number; i++){  //Adding up all the Threads' pi calculations
        pi += Thread[i].partPi;         
      }
      System.out.println("pi = " + pi/number);    //And divide that by the total number of threads to find the average pi calculation
      System.out.println("Found in " + Thread[0].totalTime + " ms"); //Printing how long it took the first thread to complete it's calculation
   }
}
class myThread extends Thread{
    int threadCt;
    double partPi;
    double temp;
    long totalTime;
    double DistX;
    double DistY;
   @Override
   public void run(){
    double hits = 0;
    double total = 0;
    final long startTime = System.currentTimeMillis();
      for (int j = 0; j < 1000000000/threadCt; j++){
        double x = ThreadLocalRandom.current().nextDouble(0, 1);  //Getting random (x,y) coordinate for dart throw
        double y = ThreadLocalRandom.current().nextDouble(0, 1);
        DistX = Math.max(0.5, x) - Math.min(0.5, x);    //Horizontal distance from center
        DistY = Math.max(0.5, y) - Math.min(0.5, y);    //Vertical distance from center
        temp = Math.sqrt(DistX*DistX + DistY*DistY);    //Distance from dart throw to center
        if(temp < 0.5)
            hits++;
        total++; 
      }
      final long endTime = System.currentTimeMillis();
      totalTime = endTime - startTime;  //How long it takes for a thread to throw all their darts
      partPi = hits/total * 4;  //The thread's calculation of pi
   }
}
//1 Thread ~16k ms
//2 Threads ~9k ms
//4 Threads ~5k ms
//8 Threads ~3k ms
//16 Threads ~3k ms