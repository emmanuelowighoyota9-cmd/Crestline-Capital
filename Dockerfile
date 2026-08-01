FROM node:20-slim

WORKDIR /app

COPY package.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npx prisma generate && npx prisma db push && npx tsx prisma/seed.ts
RUN npx next build

EXPOSE 10000
CMD npx next start -p 10000
