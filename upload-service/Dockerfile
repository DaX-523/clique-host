# upload-service/Dockerfile
FROM node:18
WORKDIR /app
COPY package.json package-lock.json ./
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y nodejs \
    npm 
RUN npm install
COPY . .
CMD "npm start" # Replace with your entry point
EXPOSE 3001
