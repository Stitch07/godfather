FROM node:14-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
COPY ormconfig.js ./

RUN yarn install --frozen-lockfile --link-duplicates

COPY dist/ dist/

CMD ["node", "."]
