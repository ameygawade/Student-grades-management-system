FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
RUN npm install mongoose
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
