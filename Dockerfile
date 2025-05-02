FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
# Explicitly copy the config file that defines path aliases
COPY jsconfig.json ./
# Or if you use TypeScript:
# COPY tsconfig.json ./
RUN npm install

# Copy application code
COPY . .

# Build the application (if needed)
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
