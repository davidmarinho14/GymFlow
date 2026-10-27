FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV PORT=3000
ENV DB_PATH=/data/gymflow.sqlite
RUN mkdir -p /data
VOLUME /data
EXPOSE 3000
CMD ["node", "src/server.js"]