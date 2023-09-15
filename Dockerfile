FROM ubuntu:20.04

ENV TERM xterm
RUN ln -fs /usr/share/zoneinfo/America/New_York /etc/localtime

RUN apt-get -y update
RUN apt-get install -y nodejs npm curl wget dnsutils certbot --fix-missing

RUN npm i -g n yarn && n 15.11

RUN node -v

WORKDIR /opt/app

COPY yarn.lock .
COPY package.json .

RUN yarn install

CMD ["sh", "-c", "cp -r node_modules code; cd code; tail -f /dev/null"]

