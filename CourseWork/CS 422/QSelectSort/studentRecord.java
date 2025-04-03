public class studentRecord {
    private final String name;
    private final double average;
    //private final int index;

    public studentRecord(String n, double a){
        name = n;
        average = a;
    }

    public String getName(){
        return name;
    }

    public double getAverage(){
        return average;
    }

    public void print(){
        System.out.println(this.name + ": " + this.average);
    }
}
