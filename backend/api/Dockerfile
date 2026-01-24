FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Copy application code
COPY . .

# Cloud Run sets PORT environment variable
ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
