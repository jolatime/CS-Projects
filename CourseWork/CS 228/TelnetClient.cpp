//Jordan Latimer
//Telnet Client
#include <sys/poll.h>
#include <sys/time.h>
#include <iostream>    
#include <stdio.h>     
#include <string.h>      
#include <netinet/in.h>  
#include <unistd.h>      
#include <sys/types.h>
#include <sys/socket.h>
#include <netdb.h>
#include <stdlib.h>

using namespace std;

const int BUFSIZE = 1024;

void CheckError(bool error, string msg) {
    if (error) {
        cout << msg << endl;
        exit(1);
    }
}

int MakeSocket(const char *host, const char *port) {
    int s, portnum, ret;
    struct sockaddr_in sa;
    struct hostent *hp = gethostbyname(host);
    
    CheckError(hp == 0, "Bad hostname lookup");
    bcopy((char *)hp->h_addr, (char *)&sa.sin_addr, hp->h_length);
    sa.sin_family = hp->h_addrtype;

    sscanf(port, "%d", &portnum);
    if (portnum > 0) {
        sa.sin_port = htons(portnum);
    } else {
        struct servent *sp = getservbyname(port, "tcp");
        CheckError(sp == 0, "Bad service lookup");
        sa.sin_port = sp->s_port;
    }

    s = socket(hp->h_addrtype, SOCK_STREAM, 0);
    CheckError(s == -1, "Could not create socket");
    
    ret = connect(s, (struct sockaddr *)&sa, sizeof(sa));
    CheckError(ret == -1, "Could not connect");
    
    return s;
}

int main(int argc, char *argv[]) {
    CheckError(argc < 3, "Usage: ./program <hostname> <port>");
    
    int sock = MakeSocket(argv[1], argv[2]);
    cout << "Connected to " << argv[1] << " on port " << argv[2] << endl;

    struct pollfd questions[2];
    questions[0].fd = 0;       // Standard input
    questions[0].events = POLLIN;
    questions[1].fd = sock;    // Server socket
    questions[1].events = POLLIN;

    string quit = "";
    char buf[BUFSIZE];

    while (true) {
        int p = poll(questions, 2, -1);
        CheckError(p == -1, "Poll error");

        // Keyboard input
        if (questions[0].revents & POLLIN) {
            int len = read(0, buf, BUFSIZE - 1);
            CheckError(len == -1, "Bad read from keyboard");
            
            buf[len] = '\0';
            quit += buf;

            int writeLen = write(sock, buf, len);
            CheckError(writeLen == -1, "Bad write to server");

            // If "quit" command is detected, exit
            if (quit.find("quit\n") != string::npos) {
                cout << "Exiting..." << endl;
                break;
            }
        }

        // Server response
        if (questions[1].revents & POLLIN) {
            int len = read(sock, buf, BUFSIZE - 1);
            CheckError(len == -1, "Bad read from server");

            if (len > 0) {
                buf[len] = '\0';
                cout << buf;
            }
        }
    }

    close(sock);
    return 0;
}