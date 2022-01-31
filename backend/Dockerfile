FROM node:16.13-alpine3.14 AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build

FROM node:16.13-alpine3.14 AS production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=prod
COPY --from=build /usr/src/app/dist ./dist
CMD [ "node", "dist/main" ]
