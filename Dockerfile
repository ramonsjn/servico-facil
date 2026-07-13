FROM node:22-slim
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY server/package*.json ./
RUN npm install

COPY server/prisma/ ./prisma/
RUN npx prisma generate

COPY server/tsconfig.json ./
COPY server/src/ ./src/
RUN npm run build

RUN rm -rf src/ prisma/ tsconfig.json

ENV PORT=3000
ENV NODE_ENV=production
ENV JWT_SECRET="qprNAfVyl0I1D+r4y8fEZsWdgUN3VBnSn5D9OaK6GhI="
ENV JWT_REFRESH_SECRET="82VYiMMoDOEKlenRZM3dh2ICljUnQJ/OvlYLOlz6HgE="
ENV CORS_ORIGIN="https://servico-facil.vercel.app"

EXPOSE 3000
CMD ["node", "dist/index.js"]
