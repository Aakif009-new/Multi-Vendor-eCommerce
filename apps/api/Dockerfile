FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (for docker caching)
COPY package.json ./
RUN npm install

# Copy source files
COPY . .

# Expose backend PORT
EXPOSE 5000

# Start backend dev server
CMD ["npm", "run", "dev"]
