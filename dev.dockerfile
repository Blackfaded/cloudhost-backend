FROM node:10
WORKDIR /usr/app/backend
COPY package*.json ./
RUN npm i