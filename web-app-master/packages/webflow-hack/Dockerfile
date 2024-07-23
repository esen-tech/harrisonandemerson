FROM node:16.14.2-alpine

WORKDIR /app

COPY . /app

RUN yarn install --production
RUN yarn workspace webflow-hack build

CMD [ "yarn", "workspace", "webflow-hack", "start" ]
