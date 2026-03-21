# Stage 1: Build
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the project
COPY . .

# Build the NestJS project (ts -> js)
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --only=production

# Copy compiled code from build stage
COPY --from=build /app/dist ./dist

# Expose NestJS default port
EXPOSE 3000

# Run the app
CMD ["node", "dist/main.js"]
