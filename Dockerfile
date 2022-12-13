FROM node:16-alpine AS app

WORKDIR /app

COPY . .
RUN npm install -g pnpm


RUN pnpm install

RUN chmod +x ./start.sh

CMD ./start.sh

FROM node:16-alpine AS hardhat

RUN npm install -g pnpm

WORKDIR /app

COPY hardhat-service.config.js hardhat.config.js
COPY hardhat_package.json package.json

RUN pnpm install


CMD pnpm hardhat node
