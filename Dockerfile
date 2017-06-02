FROM node:8.0-alpine

COPY ./lib /root/lib
WORKDIR /root/lib
RUN npm -g install yarn
RUN yarn install
RUN yarn link
CMD /usr/local/bin/drone-publish