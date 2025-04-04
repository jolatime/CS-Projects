//Jordan Latimer
//Implements a Linked List class with overloaded operators for insersion, deletion, comparison, and output
#include <iostream>
#include <set>
#include <assert.h>

using namespace std;

class Node{
    public:
    Node(int _data, Node *_next){
        data =_data;
        next = _next;
    }
    int data;
    Node *next;
    Node(){
        next = nullptr;
    }
};

class LinkedList{
    public:
    Node *head;
    LinkedList(){
        head = nullptr;
    }

    void print(){
        Node* node = head;
        while(node != nullptr){
            cout << node->data << endl;
            node = node->next;
        }
    }

    void DeleteEnd(){           //Deletes the last node in the list
        assert(head != nullptr);
        Node* node = head;
        if(node->next == nullptr){
            delete node;
            cout << "The List is Empty";
        }
        else{
            while(node->next->next != nullptr){
                node = node->next;
            }
            Node *tmp = node->next;
            node->next = nullptr;
            delete tmp;
        }
    }

    void Delete(int _data){         //Deletes a node with the desired value
        assert(head != nullptr);
        Node *node = head;
        if(node->data == _data){
            head = node->next;
            delete node;
            return;
        }
        while(node->next->data != _data && node->next != nullptr){
            node = node->next; 
        }
        if(node->next != nullptr){
            Node *tmp = node->next;
            node->next = tmp->next;
            delete tmp;  
        }
    }

    void InsertEnd(int _data){      //Inserts node at the end of the list
        if(head == nullptr){        //If there is no head then it is inserted as the head
            Node *tmp = new Node(_data, nullptr);
            tmp->data = _data;
            tmp->next = head;
            head = tmp;
        }
        else{
            Node* node = head;
            while(node->next != nullptr){
                    node = node->next; 
            }
            node->next = new Node(_data, nullptr);
            if(node->next->data == _data){
                Duplicate(_data);
            }
        }
    }

    bool Search(int _data){         //Searches the list to see if it has the desired value
        Node *node = head;
        while (node->next != nullptr){
            if(node->next->data == _data){
                return true;
            }
            node = node->next;
        }
        return false;
    }

    void Duplicate(int _data){          //Searches the list to see if there is any duplicates
        Node* node = head;
        while(node->next != nullptr){
            if(node->data == _data){
                DeleteEnd();
            }
            node = node->next;
        }
    }

    friend std::ostream& operator<< (std::ostream& stream, LinkedList &h)       //Overloads the cout operator
    {
        Node* node = h.head;
        while(node != nullptr){
            stream << node->data << " ";
            node = node->next;
        }
        return stream;
    }

    LinkedList &operator+(int num){     //Overloads the + operator
        InsertEnd(num);
        LinkedList* NewList = new LinkedList();         //Adds the number then copies the list into NewList
        LinkedList &result = *NewList;
        if(head != nullptr){
            NewList->head = new Node(head->data, nullptr);
            Copy(NewList->head);
        }
        return result;

        }

    friend LinkedList &operator+(int num, LinkedList list){  //If its num + list. flip it
        return list + num; 
    }

    void Copy(Node *n){         //Copies the list
        Node *node = head;
        while(node->next != nullptr){
            n->next = new Node(node->next->data, nullptr);
            node = node->next;
            n = n->next;
        }
    }

    LinkedList &operator-(int num){     //Overloads the - operator
        LinkedList* NewList = new LinkedList();          //Deletes the desired node (if any) then copies list to NewList
        LinkedList &result = *NewList;
        if(Search(num)){
            Delete(num);
        }
        else{ 
            cout << num << " is not in the list!" << endl;
        } 
        if(head != nullptr){
            NewList->head = new Node(head->data, nullptr);
            Copy(NewList->head);
        }
        return result;
    }

    friend LinkedList &operator-(int num, LinkedList list){     //Flips it to list - num
        return list - num;
    }

    bool operator<(int num){    //Overloads the < operator
        Node *node = head;
        while(node->next != nullptr){
            if(node->data < num){   // If there is a number in the list less than the desired value, returns true
                return true;
            }
            node = node->next;
        }
        return false;
    }
};

ostream &operator<<(ostream &os, set<int>&s)
{
   for (auto itr = s.begin(); itr != s.end(); itr++) {
        cout << *itr << " ";
    }
    return os;
}

void compare(set<int> &s1, LinkedList &l1)
{
    cout << "These should be the same" << endl;
    cout << s1 << endl;
    cout << l1 << endl;
}
int main()
{
    cout << "==========\n\n\n\n\n\n\n"  << endl;
    set<int> s;
    LinkedList l;
    s.insert(3);
    l = l + 3;
    compare(s, l);

    s.insert(13);
    l = 13 + l;
    compare(s, l);


    s.insert(1); s.insert(2); s.insert(3); s.insert(4);
    l = l + 1 + 2 + 3 + 4;
    compare(s, l);

    s.erase(4);
    l = l - 4;
    compare(s, l);

    s.erase(1);
    l = l - 1;
    compare(s, l);

    s.erase(9999);
    l = l - 9999;
    compare(s, l);

    if (l < 10)
	cout << "Good. List has something less than 10\n";
    else
	cout << "Bad answer\n";
    if (l < 1)
	cout << "Bad.  List does have something greater than 1\n";
    else
	cout << "Good answer\n";
}