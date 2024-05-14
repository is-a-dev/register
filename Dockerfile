FROM ubuntu:20.04

ENV TERM xterm
RUN ln -fs /usr/share/zoneinfo/America/New_York /etc/localtime

RUN apt-get -y update
RUN apt-get install -y nodejs npm curl wget dnsutils certbot --fix-missing
RUN apt-get install -y unzip

RUN bash -c "curl -fsSL https://bun.sh/install | bash -s 'bun-v1.0.15'"

RUN ~/.bun/bin/bun -v

WORKDIR /opt/app

COPY bun.lockb .
COPY package.json .

RUN ~/.bun/bin/bun install

CMD ["sh", "-c", "cp -r node_modules code; cd code; tail -f /dev/null"]

