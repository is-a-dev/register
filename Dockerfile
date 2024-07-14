# Uses Ubuntu 20.04 LTS
FROM ubuntu:20.04

ENV TERM xterm
RUN ln -fs /usr/share/zoneinfo/America/New_York /etc/localtime

# Run the commands apt-get update, apt-get install
RUN apt-get -y update
RUN apt-get install -y nodejs npm curl wget dnsutils certbot --fix-missing
RUN apt-get install -y unzip

# Run a bash command
RUN bash -c "curl -fsSL https://bun.sh/install | bash -s 'bun-v1.0.15'"

RUN ~/.bun/bin/bun -v

# Set the working directory
WORKDIR /opt/app

# Copy bun.lockb and package.json to the working directory
COPY bun.lockb .
COPY package.json .

# Run bun install
RUN ~/.bun/bin/bun install

# Start the service
CMD ["sh", "-c", "cp -r node_modules code; cd code; tail -f /dev/null"]

