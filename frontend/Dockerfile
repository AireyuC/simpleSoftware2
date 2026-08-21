FROM node:20-alpine

WORKDIR /app

# We only copy package files first for better caching
COPY package.json package-lock.json* ./

RUN npm install

COPY . .

# Expose Vite's default port
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
