FROM ubuntu:latest
ENV DEIAN_FRONTENT=noninteractive
WORKDIR /.
CMD ["bin/bash"]
COPY Root /. 
ENTRYPOINT ["/bin/sh","-c","sleep infinity"]