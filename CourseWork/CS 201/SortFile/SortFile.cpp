//Jordan Latimer
//Takes in a file and sorts it
#include <iostream>
#include <fstream>
#include <cstdlib>
#include <string>

using namespace std;

// Function to check if the list is sorted in ascending order
bool isSorted(double* arr, int n) {
    // Iterate through the array and check if any element is greater than the next
    for (int i = 0; i < n - 1; i++) {
        if (arr[i + 1] < arr[i]) {
            return false; // List is not sorted
        }
    }
    return true; // List is sorted
}

// Function to print all the elements in the array
void printList(double* arr, int n) {
    for (int i = 0; i < n; i++) {
        cout << arr[i] << endl; // Output each element
    }
}

// Function to sort the array in ascending order using bubble sort
double* sortList(double* arr, int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[i]) {
                // Swap elements if they are in the wrong order
                double temp = arr[j];
                arr[j] = arr[i];
                arr[i] = temp;
            }
        }
    }
    return arr; // Return the sorted array
}

// Function to calculate the mean (average) of the list
double mean(double* arr, int n) {
    double sum = 0;
    // Sum all the elements in the array
    for (int i = 0; i < n; i++) {
        sum += arr[i];
    }
    return sum / n; // Return the mean
}

// Function to calculate the mode (most frequent value) in the list
double mode(double* arr, int n) {
    int* counts = new int[n](); // Array to store count of occurrences for each element
    double mode = arr[0]; // Initialize the mode to the first element
    int maxCount = 0; // Variable to track the highest frequency

    // Count the occurrences of each number in the array
    for (int i = 0; i < n; i++) {
        counts[i]++; // Increment the count for the current number
        if (counts[i] > maxCount) {
            maxCount = counts[i]; // Update maxCount if current number appears more times
            mode = arr[i]; // Update mode to the current number
        }
    }

    delete[] counts; // Free dynamically allocated memory
    return mode; // Return the mode
}

int main(int argc, char** argv) {
    // Open input file for reading
    ifstream in("test.txt");  //Or whatever file you want sorted
    if (in.fail()) { // Check if file opening failed
        cerr << "Error opening file!" << endl;
        exit(1); // Exit if file couldn't be opened
    }

    double t;
    int n = 0;
    // Count how many valid numbers (>= 0) are in the file
    while (in >> t) {
        if (t >= 0) {
            n++;
        }
    }

    in.clear(); 
    in.seekg(0); // Rewind to the start of the file

    double* arr = new double[n]; 
    int count = 0;
    while (in >> t) {
        if (t >= 0) { // Ignore negative numbers
            arr[count++] = t;
        }
    }

    // Check if the list is already sorted
    if (isSorted(arr, n)) {
        cout << "List is already sorted: " << endl;
        printList(arr, n); // Print the sorted list
    } else {
        cout << "The list was not sorted" << endl;
        cout << "Sorted List: " << endl;
        arr = sortList(arr, n); // Sort the list
        printList(arr, n); // Print the sorted list
    }

    cout << endl;
    cout << "Min: " << arr[0] << endl;  //Print the min, max, mean, median, and mode
    cout << "Max: " << arr[n - 1] << endl;
    cout << "Mean: " << mean(arr, n) << endl;

    cout << "Median: " << (n % 2 == 0 ? arr[n / 2 - 1] : arr[n / 2]) << endl;

    cout << "Mode: " << mode(arr, n) << endl;

    delete[] arr; // Free the dynamically allocated memory
    return 0;
}