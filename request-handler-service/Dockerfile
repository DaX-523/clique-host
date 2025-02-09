# request-handler-service/Dockerfile
FROM node:20
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm i -g typescript
RUN npm install
COPY . .
CMD npm start # Replace with your entry point
EXPOSE 3003
