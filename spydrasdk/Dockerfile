FROM node:12-alpine

RUN mkdir -p /app/spydrasdk
RUN mkdir -p /app/test-network
WORKDIR /app/spydrasdk

COPY . /app/spydrasdk

RUN rm -rf node-modules
RUN npm install

EXPOSE 4000

CMD [ "node", "app.js"]
