FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (for docker caching)
COPY package.json ./
RUN npm install

# Copy source files
COPY . .

# Expose frontend PORT
EXPOSE 3000

# Start frontend dev server
CMD ["npm", "run", "dev"]
