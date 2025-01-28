# frontend/Dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install -f
RUN npm run build
CMD ["npm", "run", "start"]
EXPOSE 3000
