#Installing Base dependencies
FROM node:16-alpine3.16@sha256:2175727cef5cad4020cb77c8c101d56ed41d44fbe9b1157c54f820e3d345eab1 AS dependencies

LABEL maintainer = "Jordan Hui <jhui19@myseneca.ca>"
LABEL description = "Fragments User Interface"

WORKDIR /ui

COPY package*.json ./
CMD ["npm", "install"]

#Bulding site
FROM node:16-alpine3.16@sha256:2175727cef5cad4020cb77c8c101d56ed41d44fbe9b1157c54f820e3d345eab1 AS build

WORKDIR /ui
COPY --from=dependencies /ui /ui
COPY . .
CMD ["npm", "build"]

#Serving site
FROM nginx:1.23.2-alpine@sha256:455c39afebd4d98ef26dd70284aa86e6810b0485af5f4f222b19b89758cabf1e AS deploy

COPY --from=build /ui/dist /usr/share/nginx/html
EXPOSE 80

HEALTHCHECK --interval=15s --timeout=30s --start-period=10s --retries=3 \
    CMD curl --fail localhost || exist 1