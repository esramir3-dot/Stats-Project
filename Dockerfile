FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json backend/
COPY frontend/package*.json frontend/

RUN npm ci

COPY backend backend
COPY frontend frontend

RUN npm run build --workspace frontend

ENV NODE_ENV=production
ENV PORT=4000
ENV DATASTORE=memory

EXPOSE 4000

CMD ["npm", "start", "--workspace", "backend"]
