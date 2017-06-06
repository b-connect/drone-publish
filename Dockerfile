FROM bconnect/phing

RUN apk --update add nodejs nodejs-npm
COPY ./lib /root/lib
RUN npm -g install yarn
RUN yarn install
ENTRYPOINT ["node", "/root/lib/index.js"]
