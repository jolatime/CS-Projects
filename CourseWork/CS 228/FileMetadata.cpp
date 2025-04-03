//Jordan Latimer
//Takes hostname and file from command line, print metadata and read the bytes of the file to a new one
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

const int BUFSIZE=1024; // Buffer size for reading and writing data.

int MakeSocket(const char *host, int port) { // Function to create a socket and connect to a remote server.
	int s; 			
	int len;			
	struct sockaddr_in sa;	
	struct hostent *hp;		
	struct servent *sp;		
	int portnum;		
	int ret;			

	hp = gethostbyname(host); // Resolves the host name to an IP address.
	if (hp == 0) { 
		perror("Bad hostname lookup");
		exit(1);
	}

	bcopy((char *)hp->h_addr, (char *)&sa.sin_addr, hp->h_length); // Copy the IP address from hostent structure into sockaddr_in structure.
	sa.sin_family = hp->h_addrtype;
	sa.sin_port = htons(port);		// Convert port to network byte order and assign to sockaddr_in.

	s = socket(hp->h_addrtype, SOCK_STREAM, 0); // Create the socket using the address family and socket type.
	if (s == -1) {
		perror("Could not make socket");
		exit(1);
	}

	ret = connect(s, (struct sockaddr *)&sa, sizeof(sa)); // Connect the socket to the server using the sockaddr_in structure.
	if (ret == -1) {
		perror("Could not connect");
		exit(1);
	}

	return s;
}

// Function to check for errors and exit the program if an error occurs.
void CheckError(bool error, string msg){
    if(error){
        cout << msg << endl;
        exit(1);
    }
}

int main(int argc, char *argv[]) {
    string hostname = argv[1];		// Get the hostname (server address) from command-line argument.
    string url = argv[2];		// Get the URL (path) to request from the command-line argument.		

    char buf[1000];			// Buffer for storing received data from the server.
    char output[100000];		// Big array to hold everything
    
    // Open the file "HW2.jpg" for writing the server response (it can also be changed to .txt).
    ofstream out("HW2.jpg");  
    if (out.fail()) {		// Check if the file couldn't be opened.
        cout << "Bad bad bad" << endl;
        exit(1);  // If file open fails, exit the program.
    }

    // Create the socket and connect to the server on port 80 (HTTP).
    int sock = MakeSocket("euclid.nmu.edu", 80);
    CheckError(sock == -1, "Bad Connection");	// If socket creation fails, exit the program.

    cout << sock << endl;		// Print the socket descriptor (for debugging).

    int len, len2, length;		// Variables to hold the length of data sent and received.
    
    // Create the GET request string.
    string cmd = "GET " + url + " HTTP/1.0\r\n\r\n";
    
    // Send the GET request to the server using the socket.
    len = write(sock, cmd.c_str(), cmd.length());
    CheckError(len == -1, "Stop");

    len2 = 1;			// Initialize len2 to 1 (ensures the loop starts).
    length = 0;			// Initialize the length of the response body to 0.

    // Loop to read the server response in chunks and store it in the output buffer.
    do {
        len2 = read(sock, buf, 999);		// Read up to 999 bytes of data from the server.
        CheckError(len2 == -1, "Stop");		// If read fails, exit the program.
        buf[len2] = 0;		// Null-terminate the buffer to make it a C-string.

        // Copy the data read from the buffer into the output buffer.
        for (int i = 0; i < len2; i++) {
            output[length] = buf[i];  // Store the received data into output.
            length++;			// Increase the length of the output data.
        }
    } while (len2 > 0);		// Continue reading until there's no more data.

    // Check if the HTTP response status is "200 OK".
    if (output[9] == '2' && output[10] == '0' && output[11] == '0') {
        cout << "200 found, success" << endl;
    }

    // Search for the end of the HTTP header (which is marked by "\r\n\r\n").
    char border[] = "\r\n\r\n";		// The border that separates the header and body of the HTTP response.
    int borderEnd = 0;			// Variable to store the position where the border ends.
    int Correct = 0;			// Counter to track how many characters match the border.

    // Loop to find the end of the header in the response.
    for (int i = 0; i < length; i++) {
        if (output[i] == border[borderEnd]) {	// If the current character matches the expected border character.
            Correct++;			// Increase the match count.
            borderEnd++;		// Move to the next character of the border.
            if (Correct == 4) {		// Once the whole border is found, break the loop.
                borderEnd = i;
                cout << "borderEnd is " << i << endl;
                break;
            }
        } else {
            Correct = 0;		// Reset if there's no match.
            borderEnd = 0;		// Reset the border index.
        }
    }

    cout << borderEnd << endl;		// Print the position where the header ends (for debugging).

    // Print the HTTP header (everything before "\r\n\r\n").
    for (int i = 0; i < borderEnd; i++) {
        cout << output[i];		// Print header to the console.
    }

    // Write the body of the response (everything after "\r\n\r\n") to the output file.
    for (int i = borderEnd + 1; i < length; i++) {
        out << output[i];		// Write the body to the file 
    }
}