FROM node:16.13-alpine3.14 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev
COPY . .
ARG configuration=production
RUN npm run build -- --outputPath=./dist/out --configuration ${configuration}

FROM nginx:1.21-alpine AS production
COPY --from=build /app/dist/out /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
