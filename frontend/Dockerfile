# Build stage
FROM node:18-alpine as build

# 1. DECLARE BUILD ARGUMENTS (must match Jenkins build-args)
ARG VITE_SERVER
ARG VITE_API_KEY
ARG VITE_AUTH_DOMAIN
ARG VITE_PROJECT_ID
ARG VITE_STORAGE_BUCKET
ARG VITE_MESSAGING_SENDER_ID
ARG VITE_APP_ID

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# 2. EXPOSE ARGS AS ENVIRONMENT VARIABLES FOR VITE BUILD
# This makes the ARG values available as ENV variables for the 'npm run build' step.
ENV VITE_SERVER=$VITE_SERVER
ENV VITE_API_KEY=$VITE_API_KEY
ENV VITE_AUTH_DOMAIN=$VITE_AUTH_DOMAIN
ENV VITE_PROJECT_ID=$VITE_PROJECT_ID
ENV VITE_STORAGE_BUCKET=$VITE_STORAGE_BUCKET
ENV VITE_MESSAGING_SENDER_ID=$VITE_MESSAGING_SENDER_ID
ENV VITE_APP_ID=$VITE_APP_ID

# RUN npm run build will now successfully embed these secrets into the static files
RUN npm run build

# Serve stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]