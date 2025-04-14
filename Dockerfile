# Étape de build
FROM node:22 AS builder
WORKDIR /app

# 1. Copie des fichiers de dépendances
COPY package*.json ./

# 2. Installation COMPLÈTE (inclut TypeScript)
RUN npm install

# 3. Copie du code source
COPY . .

# 4. Build TypeScript
RUN npm run build

# Étape finale (image légère)
FROM node:22-alpine
WORKDIR /app

# 5. Copie uniquement le nécessaire pour la production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/package.json ./

EXPOSE 5001
CMD ["node", "dist/server.js"]