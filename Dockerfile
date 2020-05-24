FROM node:11 AS builder

WORKDIR /var/src/app

COPY ./package.json ./
RUN yarn install
COPY . .
RUN yarn build


FROM node:11-alpine
WORKDIR /var/src/app
COPY --from=builder /var/src/app ./

# specify port, which Heroku assigns randomly


CMD ["yarn", "start:prod"]
