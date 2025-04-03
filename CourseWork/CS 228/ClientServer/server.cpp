//Jordan Latimer
//Accepting client and sending whatever they want

#include <iostream>
#include <stdio.h>
#include <string.h>
#include <netinet/in.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netdb.h>
#include <assert.h>
#include <fstream>
#include <sys/wait.h>

using namespace std;

const int BUFSIZE = 10240;  // Maximum buffer size for reading requests

// Checks for an error condition and prints a message before exiting
void CheckError(bool error, string msg) {
    if (error) {
        cout << msg << endl;
        exit(1);
    }
}

// Creates and binds a server socket to the specified port
int MakeServerSocket(const char *port) {
    const int BACKLOG = 3;  
    struct sockaddr_in sa;
    struct hostent *hp = gethostbyname("localhost");
    
    CheckError(hp == nullptr, "Bad hostname lookup");
    
    int portnum;
    sscanf(port, "%d", &portnum);
    if (portnum == 0) {  // Convert port string to number if necessary
        struct servent *sp = getservbyname(port, "tcp");
        CheckError(sp == nullptr, "Bad service lookup");
        portnum = ntohs(sp->s_port);
    }

    sa.sin_family = AF_INET;
    sa.sin_addr.s_addr = INADDR_ANY;
    sa.sin_port = htons(portnum);

    int s = socket(AF_INET, SOCK_STREAM, 0);
    CheckError(s == -1, "Socket creation failed");

    int ret = bind(s, (struct sockaddr *)&sa, sizeof(sa));
    CheckError(ret == -1, "Bind failed");

    listen(s, BACKLOG);
    cout << "Waiting for connection on port " << port << endl;
    return s;
}

// Determines the content type based on file extension
string GetContentType(const string &ext) {
    if (ext == "txt") return "text/plain";
    if (ext == "jpg") return "image/jpeg";
    if (ext == "html") return "text/html";
    if (ext == "gif") return "image/gif";
    return "ERROR";
}

// Checks if the request comes from Google Chrome and refuses it
bool RefuseChrome(char *buf, int bufsz) {
    for (int i = 0; i < bufsz - 12; i++) {
        if (strncmp(buf + i, "Google Chrome", 13) == 0) {
            return true;  // Deny access if the request contains "Google Chrome"
        }
    }
    return false;
}

// Gets the size of an opened file
int GetFileSize(fstream &in) {
    in.seekg(0, ios::end);
    int size = in.tellg();
    in.seekg(0, ios::beg);  // Reset file pointer for reading
    return size;
}

// Extracts the requested file path from the HTTP request
string GetRequestedFile(int fd, char *buf) {
    int len = read(fd, buf, BUFSIZE - 1);
    CheckError(len == -1, "Bad read");

    buf[len] = '\0';  // Null-terminate the buffer
    string req;
    
    // Extract the requested filename from the GET request
    for (int i = 5; i < len; i++) {
        if (buf[i] == ' ') break;
        req += buf[i];
    }

    if (RefuseChrome(buf, len)) {  
        // Respond with 401 Unauthorized if the request comes from Chrome
        string header = "HTTP/1.1 401 Unauthorized. Cannot use Chrome\r\n";
        CheckError(write(fd, header.c_str(), header.length()) == -1, "Bad write");
        exit(0);
    }

    return req;
}

// Extracts the file extension and determines its content type
string ExtractFileType(const string &req) {
    size_t pos = req.find_last_of('.');
    return (pos != string::npos) ? GetContentType(req.substr(pos + 1)) : "ERROR";
}

// Handles an incoming client connection and serves the requested file
void HandleConnection(int fd, char *buf) {
    string req = GetRequestedFile(fd, buf);
    string type = ExtractFileType(req);

    fstream in(req, ios::in | ios::binary);
    if (in.fail()) {  
        // Send 404 Not Found if the file does not exist
        string header = "HTTP/1.1 404 NOT FOUND\r\n";
        CheckError(write(fd, header.c_str(), header.length()) == -1, "Bad write");
        exit(0);
    }

    int fileSize = GetFileSize(in);

    // Send response header
    string header = "HTTP/1.0 200 OK\r\nContent-Type: " + type + "\r\nContent-Length: " + to_string(fileSize) + "\r\n\r\n";
    CheckError(write(fd, header.c_str(), header.length()) == -1, "Bad write");

    // Allocate buffer and read the file content
    char *fileBuffer = new char[fileSize];
    in.read(fileBuffer, fileSize);
    in.close();

    // Send file content to client
    CheckError(write(fd, fileBuffer, fileSize) == -1, "Bad write");
    
    delete[] fileBuffer;  // Free allocated memory
    exit(0);
}

int main(int argc, char *argv[]) {
    CheckError(argc < 2, "Usage: ./server <port>");

    int serverSocket = MakeServerSocket(argv[1]);
    char buf[BUFSIZE];

    while (true) {
        struct sockaddr_in sa;
        socklen_t sa_len = sizeof(sa);
        int fd = accept(serverSocket, (struct sockaddr *)&sa, &sa_len);
        CheckError(fd == -1, "Accept failed");

        int pid = fork();
        CheckError(pid == -1, "Fork failed");

        if (pid == 0) {
            HandleConnection(fd, buf);  // Child process handles request
        } else {
            // Parent reaps zombie processes
            int status;
            while (waitpid(-1, &status, WNOHANG) > 0);
            close(fd);
        }
    }
}