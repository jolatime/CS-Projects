//Jordan Latimer
//This program takes a number and will return the square root of it to a desired length after the decimal
#ifndef _PROGRAM1_
#define _PROGRAM1_

#include <iostream>
#include <string>
#include <cstdlib>
using namespace std;

void SquareRoot(string sqrt, string dec); 
int main(int argc, char** argv);
string multiply(string a, string b);
void trim(string& a);
string add(string a, string b);
string subtract(string a, string b);
string SubFailed(string a);	//If the Subtraction fails, ans*2
string SubWorked(string a); //If the Subtraction works, ans*2+1
string Compare(string a, string b); //Compares two strings, returns the greater one
string sqrtFour(string a, string c); //determines the fours collumn
#endif

