#Instructions for Docker

#Docker image from alpine node version 16.3.16
FROM node:16-alpine3.16@sha256:2175727cef5cad4020cb77c8c101d56ed41d44fbe9b1157c54f820e3d345eab1

LABEL maintainer = "Jordan Hui <jhui19@myseneca.ca>"
LABEL description = "Fragments User Interface"

#Default Port
ENV PORT = 1234
#Reduce console output from installation within Docker
ENV NPM_CONFIG_LOGLEVEL = warn
#Disable color when running within Docker
ENV NPM_CONFIG_COLOR = false
#Setting env to production mode
ENV NODE_ENV = production

#Use /UI as working directory
WORKDIR /UI

#Copies package.json and package-lock.json into curent working directory (/app)
COPY package*.json ./

#Install dependencies from package.json
RUN npm install

#Copy src to /UI/src
COPY ./src ./src

#Start container by running server
CMD ["npm", "start"]

#Running on port 1234
EXPOSE 1234