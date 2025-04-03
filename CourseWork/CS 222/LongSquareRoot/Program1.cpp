//Jordan Latimer
//This program takes a number and will return the square root of it to a desired length after the decimal
#include <iostream>
#include <string>
#include <cstdlib>
#include "Program1.h"
using namespace std;

int main(int argc, char** argv) {
	cout << "What number would you like to take the square root of? ";
	string sqrt;
	getline(cin, sqrt);
	
	if (sqrt < "0") { //Making sure the inputed number is not negative
		cout << "Number cannot be negative!";
	}
	else if(sqrt == "0") {
		string dec;
		getline(cin, dec);
		string places;
		for (int i = 0; i < stoi(dec); i++) {
			places += "0"; //Will add zeros until the desired length is matched.
		}
		cout << "The Answer is 0." << places << endl; //If zero is inputted, the answer is zero, with however many zeros after the decimal as requested
	}
	
	else {
		cout << "To how many decimal places? ";
		string dec;
		getline(cin, dec);
		SquareRoot(sqrt, dec);
	}
}

string multiply(string a, string b) { //Multiplies two strings together

	trim(a);
	trim(b);
	string sum = "0";
	for (int i = 0; i < a.length(); i++)
		for (int j = 0; j < b.length(); j++) {
			int prod = (a[i] - '0') * (b[j] - '0');
			string addend = to_string(prod);
			for (int k = 0; k < a.length() - 1 - i + b.length() - 1 - j; k++)
				addend += "0";
			sum = add(sum, addend);
		}
	return sum;
}

void trim(string& a) {  //Trims non-integer characters
	while (a.length() > 1 && a[0] == '0') a = a.substr(1);
}

string add(string a, string b) { //Adds two strings together
	trim(a);
	trim(b);
	while (a.length() < b.length()) a = "0" + a;
	while (b.length() < a.length()) b = "0" + b;
	a = "0" + a;
	b = "0" + b;
	string ans = "";
	int carry = 0;
	for (int i = a.length() - 1; i >= 0; i--) {
		int sum = (a[i] - '0') + (b[i] - '0') + carry;
		ans = (char)(sum % 10 + '0') + ans;
		carry = sum / 10;
	}
	trim(ans);
	return ans;
}

string subtract(string a, string b) {

	trim(a);
	trim(b);
	while (a.length() < b.length()) a = "0" + a;
	while (b.length() < a.length()) b = "0" + b;
	for (int i = 0; i < b.length(); i++)
		b[i] = (char)('9' - b[i] + '0'); //Finding 9's complement
	string diff = add(add(a, b), "1").substr(1);
	trim(diff);
	return diff;
}

void SquareRoot(string sqrt, string dec) {
	int zeros = stoi(dec);
	string z = "1";
	for (int i = 0; i < zeros; i++) { //Determines how many zeros are required by multiplying 1 by 100 equal to the amount that was inputed for the desired decimal places.
		z = multiply(z, "100"); 
	}
	sqrt = multiply(z, sqrt);
	
	int p = sqrt.length() * 2;
	string* fours = new string[p]; //Making the String array of fours at least double the length of the original input value. 
	fours[0] = "1";
	for (int i = 0; i < p - 1; i++) {
		fours[i + 1] = multiply(fours[i], "4"); //Increments the array by multiples of 4
		if (Compare(fours[i + 1], sqrt) == fours[i+1]) { //If the next number in the array is bigger than the original input, that value will be set to 0
			fours[i + 1] = "0";
		}
	}

	/*for (int i = 0; i < p; i++) { //Testing if the array works or not
		cout << fours[i] << endl;
	}*/

	int y = p - 1;
	while (fours[y] == "0") { //Once the array increments to a value higher than the original sqrt input, they are replaced with 0's, which then the last non zero integer will be used as the starting point, working downwards.
		y--;
	}

	string n = sqrt;
	string ans = "0";
	string prod;	//the product between 4 and ans
	string product;	//the sum of prod and 1
	string four;	//the number in the fours collumn
	string difference;


	while (y >= stoi("0")) {
		string four = sqrtFour(fours[y], ans);

		if (Compare(n, four) == n || n == four) { //If the substraction would work, then subtract. Ans is then *2+1
			difference = subtract(n, four);
			ans = SubWorked(ans);
			n = difference; //the new n is the difference
		}
		else {
			ans = SubFailed(ans);	//Else the ans is multplied by 2
			if (fours[y] == "1") {
				n = difference;
			}
		}
		//cout << "The fours is: " << four << endl;
		//cout << "The difference is : " << difference << endl;


		//cout << "the new ans is: " << ans << endl;

		y--; //y will increment down the array until it is exhaused
	
	}
	//cout << sqrt << " = " << ans << "^2" << " + " << n << endl;
	int w = ans.length();
	string ANSWER = ans.insert(stoi(subtract(to_string(w), dec)), "."); //Finds where to place the decimal point after the math is done
	cout << "The answer is: " << ANSWER << endl;

}

string SubFailed(string a) { //If the Subtraction fails, ans*2
	a = multiply("2", a);
	return a;
}
string SubWorked(string a) {  //If the Subtraction works, ans*2+1
	a = add(multiply(a, "2"), "1");
	return a;
}

string Compare(string a, string b) { //compares two strings, and returns the larger one
	string bigger;
	if (a.length() > b.length()) { //If one is longer than the other, that must be the bigger number, it gets returned
		return a;
	}
	if (a.length() < b.length()) {
		return b;
	}
	if (a.length() == b.length()) { //If the strings are of equal length, goes through and compares each position until a bigger number is found
		for (int i = 0; i < a.length(); i++) {
			if (a[i] > b[i]) {
				return a;
			}
			else if (a[i] < b[i]) {
				return b;
			}
		}
	}
	return bigger;
}

string sqrtFour(string a, string c) { // a = fours[y]; c = ans
	string prod = multiply("4", c);
	string product = add(prod, "1");
	string four = multiply(a, product); // where the 4*ans+1 takes place
	return four;
}