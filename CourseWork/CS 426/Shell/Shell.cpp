//Jordan Latimer
//Final project; implementation of a shell
#include <iostream>
#include <cstdlib>
#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <wordexp.h>
#include <string>
#include <fstream>
#include <sstream>
#include <vector>
#include <fcntl.h>
#include <sys/wait.h>
#include <readline/readline.h>
#include <readline/history.h>

using namespace std;

void doIt(vector<string> input, const char* history);
void redirectionCheck(vector<string>& input);
void queueCommands(vector<string>& input);
void processCommands(vector<string>& input, char* command, const char* seperator);

vector<char*> convert(vector<string> input){//Copying a string vector into an char vector
    //cout << "test";
    vector<char*> charInput;
    for (int i = 0; i < input.size(); i++){
        charInput.push_back(const_cast<char*>(input[i].c_str()));   //type casting to const char*
    }
    charInput.push_back(0);  //null terminating
    return charInput;
}

void processCommands(vector<string>& input, char* command, const char* seperator){
    char* word = strtok(command, seperator);  //strtok -> stackoverflow
        while (word != nullptr){
            input.push_back(word);      //Parsing and putting the results into a string vector
            word = strtok(nullptr, seperator);
        }
}

void execIt(vector<string> input){
    vector<char*> charInput = convert(input); //converting the vector for exec
    string command = "/bin/" + input[0];
    execv(command.c_str(), charInput.data()); 
}

void runFile(string cmdFile, vector<string> input){ //opens a file then runs the commands line by line
    input.clear();
    string line;
    ifstream file(cmdFile);  //opens file
    if(!file.is_open()) cerr << "Cannot open file";
    else{
        while(getline(file, line)){
            input.clear();
            string word;
            stringstream ss(line); //stringstream -> stackoverflow
            while(ss >> word)
                input.push_back(word);  //Clears original input then inputs the commands from the file into the vector
            doIt(input, ".history.txt");
        }
    }
    file.close();
}

void redirectionCheck(vector<string>& input){
    int fd;
    string tmp;
    int i;
    for(i = 0; i < input.size(); i++){
        if(input[i] == ">"){   //file input redirection
            if(i + 1 < input.size()){
                fd = open(input[i + 1].c_str(), O_WRONLY | O_CREAT | O_TRUNC, 0660); //Creates or opens file
                if(fd == -1){
                    perror("Failed");
                    return;
                }
            }
            if(dup2(fd, 1) == -1) perror("Failed");
            close(fd);
            input.erase(input.begin() + i, input.begin() + i + 2); //Deletes > and file after
            break;
        }
        else if(input[i] == ">>"){    //file input redirection in append mode
            if(i + 1 < input.size()){
                fd = open(input[i + 1].c_str(), O_WRONLY | O_CREAT | O_APPEND, 0660);
                if(fd == -1){
                    perror("Failed");
                    return;
                }
            }
            if(dup2(fd, 1) == -1) perror("Failed");
            close(fd);
            input.erase(input.begin() + i, input.begin() + i + 2); //Deletes > and file after
            break;
        }
        else if(input[i] == "<"){
            if(i + 1 < input.size()){
                fd = open(input[i+1].c_str(), O_RDONLY);
                if(fd == -1){
                    perror("Failed");
                    return;
                }
            }
            if(dup2(fd, 0) == -1){
                perror("Failed");
                close(fd);
                return;
            }
            close(fd);
            input.erase(input.begin() + i, input.begin() + i + 2);
            break;
        }

    }
}

void queueCommands(vector<string>& input){
    string command;
    vector<string> commandsvec;
    string tmp;
    for(int i = 0; i < input.size(); i++){
        if(input[i] == ";"){ //If there is a ; add the command to the vector
            commandsvec.push_back(command);
            command.clear();
        }
        else{
            if(!command.empty()){  //Add a space after the command
                command += " ";
            }
            command += input[i];  //Add the input to the string
        }
    }
    if(!command.empty()){ //push the other command into the vector
        commandsvec.push_back(command);
    }
    processCommands(commandsvec, const_cast<char*>(tmp.c_str()), " ");
    for (const string& cmd : commandsvec) { //iteration strategy from stackoverflow, just parsing the vector and execing each command
        vector<string> cmdInput;
        processCommands(cmdInput, const_cast<char*>(cmd.c_str()), " ;");
        doIt(cmdInput, ".history.txt");
    }
}

void doIt(vector<string> input, const char* history){
    for(int i = 0; i < input.size(); i++){  //If theres a ; run queueCommands
        if(input[i] == ";"){
           queueCommands(input);
           return;
        }
    }
    int junk;
    if(input[0] == "cd"){
            if(chdir(input[1].c_str()) != 0)    //Change directory
                perror("cd failed");
    }
    else if(input[0] == "exit"){                //exits
        cout << "EXITING" << endl;
        write_history(history);  //saving the history upon exit
        exit(0);
    }
    else if(input[0] == ".") runFile(input[1], input); //run the file after .
    else{
        int pid = fork();
        if(pid == 0){
            redirectionCheck(input);  //Checks for <, >, or >>
            execIt(input);
            exit(0);
        }
        else if(pid > 0){
            waitpid(pid, &junk, 0);
        }
        else{
            perror("Fork failed");
        }
    }
}

int main(){
    const char* history = ".history.txt";
    read_history(history);
    while(true){
        int junk;
        vector<string> input;
        char *in = readline("$");
        if(in == nullptr){
            continue;
        }
        if (strlen(in) > 0){ //add the input to history
            add_history(in);
        }
        //add_history(in);
        processCommands(input, in, " ");
        doIt(input, history);
        free(in);
    }
}