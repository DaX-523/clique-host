# deploy-service/Dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y nodejs \
    npm 
RUN npm install
CMD "npm start" # Replace with your entry point
EXPOSE 3002
