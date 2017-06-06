FROM alpine:latest

RUN apk --update add nodejs nodejs-npm
RUN   rm -rf \/var/cache/apk/*
ADD ./index.js /root
ADD ./package.json /root
RUN npm -g install yarn
WORKDIR /root
RUN yarn install
ENTRYPOINT ["node", "/root/index.js"]
