FROM node:lts-alpine as build-stage

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . . 

RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
# configure nginx to serve single page app
COPY nginx.conf /etc/nginx/nginx.conf
#start up nginx
CMD ["nginx", "-g", "daemon off;"]