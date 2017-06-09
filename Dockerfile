FROM alpine:latest

RUN apk --update add nodejs nodejs-npm  git
RUN apk --update add gcc libgcc libstdc++ make expat expat-dev build-base g++ libc6-compat
RUN apk --update add python 
RUN node --version
ADD ./index.js /root
ADD ./lib /root/lib
ADD ./package.json /root
RUN npm -g install yarn
WORKDIR /root
RUN yarn install
RUN apk del --purge gcc libgcc libstdc++ make expat expat-dev build-base g++ libc6-compat python
RUN rm -rf \/var/cache/apk/*

ENTRYPOINT ["node", "/root/index.js"]
