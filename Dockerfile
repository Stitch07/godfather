# Build image
FROM node:14-alpine as BUILDER

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile --link-duplicates

COPY . ./
COPY src/config.example.ts src/config.ts

RUN yarn build:prod

# Production image
FROM node:16-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package.json ./
COPY yarn.lock ./
COPY ormconfig.js ./

RUN yarn install --frozen-lockfile --link-duplicates

COPY --from=BUILDER /usr/src/app/dist/ dist/
COPY --from=BUILDER /usr/src/app/assets/ assets/

ENTRYPOINT [ "yarn" ]
