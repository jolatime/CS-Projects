//Jordan Latimer
//Concatinates files together through the use of mmap
#include <sys/types.h>
#include <iostream>
#include <fcntl.h>
#include <sys/mman.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/stat.h>
#include <unistd.h>
#include <string.h>

using namespace std;

int main(int argc, char *argv[]){
    char *output = argv[argc-1];
    int destination = open(output, O_RDWR | O_CREAT | O_EXCL | O_TRUNC, 0644);  //Creates the output file, error if it already exists
    if (destination == -1) {
        perror("COULD NOT OPEN FILE");
        exit(0);
    }

    off_t offset = 0;
    for (int i = 1; i < argc - 1; i++) {  //Opens all the input files
        int input = open(argv[i], O_RDONLY);
        if (input == -1)
            perror("COULD NOT OPEN INPUT FILE ");
        struct stat info;
        if (fstat(input, &info) == -1) {  //Gets the file size
            perror("COULDNT GET INFO ON FILE 1");
        }

        off_t new_size = offset + info.st_size; //Sets the output file size
        if (ftruncate(destination, new_size)== -1) {
            perror("UNABLE TO GET FILE SIZE");
        }

        char *orig = (char *)mmap(NULL, info.st_size, PROT_READ, MAP_PRIVATE, input, 0);// Map original file and close its descriptor:
        if (orig == MAP_FAILED) {
            perror("MAPPING ORIGINAL FILE FAILED");
        }
        close(input);
        off_t pa_offset = offset & ~(sysconf(_SC_PAGE_SIZE) - 1);  //From mmap manual page
        char *dest = (char *)mmap(NULL, info.st_size, PROT_WRITE | PROT_READ, MAP_SHARED, destination, pa_offset);// Map destination file and close its descriptor:
        if (dest == MAP_FAILED) {
            perror("MAPPING DESTINATION FILE FAILED");
        }

        if(madvise(orig, info.st_size, MADV_SEQUENTIAL) == -1){ //Tells the kernal the memory is to be used sequentially
            perror("FAILURE");
        }
        memcpy((char*)dest+offset, orig, info.st_size);
        offset += info.st_size;
        munmap(orig, info.st_size); // Unmap files:
        munmap(dest, info.st_size);
    }
    close(destination);
    return 0;
}