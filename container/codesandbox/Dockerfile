# docker build -t codesandbox .
FROM node:14-alpine
LABEL maintainer="hangxingliu@gmail.com"

RUN npm install npm -g
RUN npm install codesandbox -g

ENV CODESANDBOX_JSON=/codesandbox/.codesandbox.json
WORKDIR /
ENTRYPOINT ["/usr/local/bin/codesandbox"]
