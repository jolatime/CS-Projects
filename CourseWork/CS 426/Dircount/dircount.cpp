//Jordan Latimer
//Traverses a directory and prints out all files, directories, symbolic links, permissions, size, etc
#include <iostream>
#include <cstdlib>
#include <string>
#include <string.h>
#include <dirent.h>
#include <sys/stat.h>
#include <unistd.h>
#include <list>
#include <assert.h>
#include <set>
#include <sys/types.h>
#include <stdio.h>

using namespace std;

void searchDir(string& basePath, set<int>& iNodes, int& totalSize);

void isDir(dirent* de, string& basePath, set<int>& iNodes, int& totalSize){
    string dirPath = basePath + "/" + de->d_name;  //Update the path
    int inode = de->d_ino;
    if(iNodes.find(inode) != iNodes.end())  //If the iNode has already been seen, return
        return;
    cout << dirPath << " (d)" << endl;
    iNodes.insert(inode);                   //Insert the iNode into the set
    searchDir(dirPath, iNodes, totalSize);  //Moves on and recurses
}

void isFile(dirent* de, string& basePath, set<int>& iNodes, int& totalSize){  
    string filePath = basePath + "/" + de->d_name;
    struct stat file;
    if(stat(filePath.c_str(), &file) != 0){  //Getting file size
        cout << de->d_name << endl;
        perror("Fail");
    }

    if(iNodes.find(file.st_ino) != iNodes.end())
        return;

    cout << filePath << " (f," << file.st_size << ",";
    cout << ((file.st_mode & S_IRUSR) ? "r" : "-");
    cout << ((file.st_mode & S_IWUSR) ? "w" : "-");
    cout << ((file.st_mode & S_IXUSR) ? "x" : "-");
    cout << ((file.st_mode & S_IRGRP) ? "r" : "-");
    cout << ((file.st_mode & S_IWGRP) ? "w" : "-");  //Implementation of permissions
    cout << ((file.st_mode & S_IXGRP) ? "x" : "-");
    cout << ((file.st_mode & S_IROTH) ? "r" : "-");
    cout << ((file.st_mode & S_IWOTH) ? "w" : "-");
    cout << ((file.st_mode & S_IXOTH) ? "x" : "-");
    cout << ")" << endl;
    totalSize += file.st_size;  //Increase total size
    iNodes.insert(file.st_ino);
}

void isLink(dirent* de, string& basePath){
    string linkPath = basePath + "/" + de->d_name;
    char buf[1024];
    ssize_t len;
    len = readlink(linkPath.c_str(), buf, sizeof(buf)-1);  //Finds what the link is pointing to
    if(len == -1){
        perror("FAIL");
        return;
    }
    buf[len] = '\0';
    cout << linkPath << " (l,-> " << buf << ")" << endl; //prints it out
}

void searchDir(string& basePath, set<int>& iNodes, int& totalSize){
    DIR *d = opendir(basePath.c_str());                   
    assert(d != NULL);                      //Use of assert, checks if the directory opened correctly
    while(auto de = readdir(d)){            //Use of auto, reads the directory
        if(de->d_name[0] != '.'){
            if(de->d_type == DT_DIR){    //If it's a directory
                isDir(de, basePath, iNodes, totalSize);
            }
            if(de->d_type == DT_REG){     //If it's a file
                isFile(de, basePath, iNodes, totalSize);
            }
            if(de->d_type == DT_LNK){     //If it's a link
                isLink(de, basePath);
            }
        }
    }
    closedir(d);
}

int main(int argc, char *argv[]){
    string basePath = argv[1];
    int totalSize;  //Keeps track of the total size of the path
    set<int> iNodes;  //Keeps track of what iNodes it has come across
    searchDir(basePath, iNodes, totalSize);
    cout << "Total Size is: " << totalSize << endl;
}