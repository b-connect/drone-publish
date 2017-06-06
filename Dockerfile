FROM bconnect/phing

RUN apk --update add nodejs nodejs-npm
COPY ./lib /root/lib
WORKDIR /root/lib
RUN npm -g install yarn
RUN yarn install
RUN npm link
ENTRYPOINT ["drone-publish"]
