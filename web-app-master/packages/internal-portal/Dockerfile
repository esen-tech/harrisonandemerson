FROM node:16.14.2-alpine

WORKDIR /app

COPY . /app

RUN yarn install --production
RUN yarn workspace internal-portal build

CMD [ "yarn", "workspace", "internal-portal", "start" ]
