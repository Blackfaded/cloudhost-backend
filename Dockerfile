FROM node:10 as modules
WORKDIR /usr/app/backend
COPY package*.json ./
RUN npm i

FROM modules as build
COPY . .
EXPOSE 3000