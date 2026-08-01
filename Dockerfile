FROM node:20-slim

WORKDIR /app

# Install dependencies for Prisma SQLite
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install

COPY . .

ENV DATABASE_URL="file:./prisma/dev.db"
ENV JWT_SECRET="crestline-capital-prod-secret-change-this-32-chars!!"
ENV NODE_ENV="production"
ENV ADMIN_EMAIL="admin@crestlinecapital.com"
ENV ADMIN_PASSWORD="Admin@E86800"

RUN npx prisma generate
RUN npx prisma db push
RUN npx tsx prisma/seed.ts
RUN npm run build

EXPOSE 10000

CMD npx prisma db push && npx tsx prisma/seed.ts && npx next start -p 10000
