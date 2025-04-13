# Étape de build
FROM node:18 AS builder
WORKDIR /app

# 1. Copie des dépendances
COPY package*.json ./

# 2. Installation (prod seulement pour réduire la taille)
RUN npm install --production

# 3. Copie du code source
COPY . .

# 4. Build TypeScript
RUN npm run build

# Étape finale
FROM node:18-alpine
WORKDIR /app

# 5. Copie uniquement le nécessaire
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/package.json ./

EXPOSE 5001
CMD ["node", "dist/server.js"]