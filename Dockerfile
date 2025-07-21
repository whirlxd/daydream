# Use Node.js LTS version
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock* package-lock.json* ./

# Install all dependencies (needed for build)
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG AIRTABLE_API_KEY=""
ARG AIRTABLE_BASE_ID=""
ARG AIRTABLE_TABLE_NAME=""

# Set environment variables from build args
ENV AIRTABLE_API_KEY=$AIRTABLE_API_KEY
ENV AIRTABLE_BASE_ID=$AIRTABLE_BASE_ID
ENV AIRTABLE_TABLE_NAME=$AIRTABLE_TABLE_NAME

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "build"]
