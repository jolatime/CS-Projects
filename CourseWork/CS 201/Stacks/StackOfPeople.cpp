//Jordan Latimer
//This is an implementation of a stack in C++

#include <iostream>
#include <fstream>
#include <string>
#include <cassert>
using namespace std;

class Person { // person class
private:
    string name;
    int age;
public:
    Person(string n, int a) { // constructor
        name = n;
        age = a;
    }

    // Print person details
    friend ostream& operator<<(ostream& stream, Person &p) {
        stream << p.name << " " << p.age << endl;
        return stream;
    }
};

class Stack { // stack class
private:
    Person* data[100]; // stack storage
    int count;

public:
    Stack() { // constructor
        count = 0;
    }

    void Push(Person* newPerson) { // push a person to the stack
        if (count == 100) {
            cout << "Stack is full, cannot add more." << endl;
        }
        else {
            data[count] = newPerson;
            count++;
        }
    }

    Person* Pop() { // pop a person from the stack
        if (count == 0) {
            cout << "Stack is empty, cannot pop." << endl;
            return nullptr;
        }
        else {
            count--;
            return data[count]; // return top person and decrease count
        }
    }

    bool IsEmpty() { // check if stack is empty
        return count == 0;
    }

    bool IsFull() { // check if stack is full
        return count == 100;
    }

    // Print stack contents
    friend ostream& operator<<(ostream& stream, Stack &s) {
        if (s.IsEmpty()) {
            stream << "Stack is empty." << endl;
        }
        else {
            for (int i = s.count - 1; i >= 0; i--) { // print from top to bottom
                stream << *s.data[i];
            }
        }
        return stream;
    }
};

int main() {
    Stack stack;
    ifstream in("Input.txt");
    if (!in) {
        cout << "File error!" << endl;
        return 1;
    }

    string command;
    while (getline(in, command)) { // read each line in the file
        if (command[0] == '+') { // push a person to the stack
            string name;
            for (int i = 2; i < command.length(); i++) {
                if (command[i] > '9') {
                    name += command[i]; // get name
                }
            }
            string ageStr = command.substr(command.find_last_of(" ") + 1);
            int age = stoi(ageStr); // get age
            Person* newPerson = new Person(name, age);
            stack.Push(newPerson);
            cout << "Pushed: " << *newPerson << endl;
        }
        else if (command[0] == '-') { // pop a person from the stack
            Person* p = stack.Pop();
            if (p != nullptr) {
                cout << "Popped: " << *p << endl;
                delete p; // free memory
            }
        }
        else { // print stack
            cout << "Print Stack:" << endl;
            cout << stack;
        }
    }

    return 0;
}