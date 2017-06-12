FROM alpine:latest

RUN apk --update add nodejs nodejs-npm  git
RUN apk --update add gcc libgcc libstdc++ make expat expat-dev build-base g++ libc6-compat
RUN apk --update add python 
RUN node --version

ADD ./index.js /root
RUN mkdir /root/lib
ADD ./lib/composer.js /root/lib/composer.js
ADD ./lib/drupal.js /root/lib/drupal.js
ADD ./lib/drupalversion.js /root/lib/drupalversion.js
ADD ./lib/helper.js /root/lib/helper.js
ADD ./lib/page.js /root/lib/page.js
ADD ./package.json /root
RUN npm -g install yarn
WORKDIR /root
RUN yarn install
RUN apk del --purge gcc libgcc libstdc++ make expat expat-dev build-base g++ libc6-compat python
RUN rm -rf \/var/cache/apk/*

ENTRYPOINT ["node", "/root/index.js"]
