#include <iostream>
#include <stdio.h>
#include <string.h>
#include <netinet/in.h>
#include <fstream>
#include <unistd.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netdb.h>
#include <stdlib.h>

using namespace std;

const int BUFSIZE = 1024;

// Function to create a socket and connect to the SMTP server
int MakeSocket(const char *host, int port) {
    int s;
    int len;
    struct sockaddr_in sa;
    struct hostent *hp;
    struct servent *sp;
    int portnum;
    int ret;

    // Get the host by name (e.g., "gmail-smtp-in.l.google.com")
    hp = gethostbyname(host);
    if (hp == 0) {
        perror("Bad hostname lookup");
        exit(1);
    }

    // Fill the sockaddr_in structure with host info
    bcopy((char *)hp->h_addr, (char *)&sa.sin_addr, hp->h_length);
    sa.sin_family = hp->h_addrtype;
    sa.sin_port = htons(port);

    // Create a socket for communication
    s = socket(hp->h_addrtype, SOCK_STREAM, 0);
    if (s == -1) {
        perror("Could not make socket");
        exit(1);
    }

    // Connect to the server
    ret = connect(s, (struct sockaddr *)&sa, sizeof(sa));
    if (ret == -1) {
        perror("Could not connect");
        exit(1);
    }

    return s; // Return the socket descriptor
}

// Function to check for errors and print messages
void CheckError(bool error, string msg) {
    if (error) {
        cout << msg << endl;
        exit(1);
    }
}

// Function to send data to the server (write to socket)
void writing(int sock, string cmd) {
    int len = write(sock, cmd.c_str(), cmd.length());
    CheckError(len == -1, "Bad Connection");
}

// Function to read server's response
void reading(int len2, int sock, char buf[]) {
    len2 = read(sock, buf, 999); // Read data from the socket
    CheckError(len2 == -1, "Bad Connection");
    buf[len2] = 0; // Null-terminate the string
    cout << buf; // Print the server response
}

// Function to send command to server and read response
void writeAndRead(int sock, char buf[], string cmd) {
    int len = write(sock, cmd.c_str(), cmd.length()); // Send the command
    CheckError(len == -1, "Bad Connection");
    int len2 = read(sock, buf, 999); // Read the server's response
    CheckError(len2 == -1, "Bad Connection");
    buf[len2] = 0; // Null-terminate the response
    cout << buf; // Print the server's response
}

// Function to handle user input and send SMTP commands
void userInput(int sock, char buf[]) {
    string to; // Recipient's email address
    string to2;
    string from2; // Sender's email address
    string from;
    string ans;

    // Loop through the steps for sending an email
    for (int i = 0; i < 6; i++) {
        if (i == 0) {
            cout << "HELO ";
            getline(cin, ans); // Get HELO response from user
            ans = "HELO " + ans + "\r\n"; // Add SMTP line break
            writeAndRead(sock, buf, ans); // Send HELO command to the server
        }
        else if (i == 1) {
            cout << "MAIL FROM: ";
            getline(cin, from); // Get sender's email address
            from2 = "MAIL FROM:<" + from + ">\r\n"; // Format the MAIL FROM command
            cout << ans;
            writeAndRead(sock, buf, from2); // Send MAIL FROM command
        }
        else if (i == 2) {
            cout << "RCPT TO: ";
            getline(cin, to); // Get recipient's email address
            to2 = "RCPT TO:<" + to + ">\r\n"; // Format the RCPT TO command
            writeAndRead(sock, buf, to2); // Send RCPT TO command
        }
        else if (i == 3) {
            string data = "DATA\r\n"; // Prepare the DATA command
            writeAndRead(sock, buf, data); // Send DATA command
        }
        else if (i == 4) {
            ans = "To:" + to + "\r\n"; // Format the "To" header
            writing(sock, ans); // Send the "To" header
        }
        else {
            ans = "From: " + from + "\r\n"; // Format the "From" header
            writing(sock, ans); // Send the "From" header
        }
    }
}

// Function to send metadata (headers) of the email
void metaData(int sock) {
    for (int i = 0; i < 4; i++) {
        string info;
        if (i == 0)
            info = "Date:Fri, 23 Feb 2024 15:39:15\r\n"; // Static Date header
        else if (i == 1)
            info = "Message-ID:<CAEb5kgpPWSWWqL0Kj=Nui2NbTcF+_tB6CKXfAQzdZBpK6wzp=w@mail.gmail.com>\r\n"; // Static Message-ID
        else if (i == 2) {
            cout << "Subject: ";
            getline(cin, info); // Get the subject of the email
            info = "Subject: " + info + "\r\n"; // Format the subject header
        }
        else if (i == 3)
            info = "\r\n"; // Empty line after the headers
        writing(sock, info); // Send the header information
    }
}

int main(int argc, char *argv[]) {
    char buf[1000]; // Buffer to store server responses
    int sock = MakeSocket("gmail-smtp-in.l.google.com", 25); // Connect to SMTP server
    int len, len2, length;

    read(sock, buf, 999); // Read initial server response

    string ans;
    userInput(sock, buf); // Get user input and send SMTP commands
    metaData(sock); // Send email metadata (headers)

    string message;
    cout << "What is your message: ";
    getline(cin, message); // Get the email body from user
    message = message + "\r\n"; // Add a line break at the end
    writing(sock, message); // Send the email body

    writeAndRead(sock, buf, ".\r\n"); // Send the end of message signal
    writeAndRead(sock, buf, "QUIT\r\n"); // Close the connection to the server
}