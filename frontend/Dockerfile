FROM node:18
WORKDIR /app
COPY . .
RUN npm i && npm run build
CMD ["npm", "run", "start"]
EXPOSE 3000