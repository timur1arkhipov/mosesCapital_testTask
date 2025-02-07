FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production
ENV REDIS_URL=redis://redis:6379

CMD ["npm", "start"]

