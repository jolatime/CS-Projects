FROM ubuntu:latest
WORKDIR /.
CMD ["bin/bash"]
COPY Root /. 
