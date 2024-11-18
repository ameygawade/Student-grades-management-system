# Use Node.js as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .
RUN npm install

# Optional: Install dotenv if you need it
RUN npm install dotenv

# Copy application code
COPY . .

# Expose the port the service will run on
EXPOSE 3000

# Start the service
CMD ["npm", "start"]
