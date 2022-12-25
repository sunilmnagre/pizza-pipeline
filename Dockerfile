# Get the nodejs from docker-hub
FROM node:18-alpine

# Create app directory
RUN mkdir -p /pizza-pipeline

# Make working directory for this app
WORKDIR /pizza-pipeline

# Copy app dependencies
COPY package.json /pizza-pipeline

# Install app dependencies
RUN npm install -g nodemon
RUN npm install

# Bundle app source
COPY . /pizza-pipeline

# Start the application
CMD ["npm", "start"]