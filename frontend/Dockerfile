# ----- Etapa 1: Compilación (Build) -----
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependencias
COPY package.json package-lock.json ./
RUN npm install

# Copia el código y construye la app
COPY . .
RUN npm run build

# ----- Etapa 2: Producción (Production) -----
FROM node:20-alpine

WORKDIR /app

# Copia solo los archivos necesarios de la etapa de 'build'
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

# Instala SOLO las dependencias de producción
RUN npm install --production

# Expone el puerto 3000 (el puerto por defecto de Next.js)
EXPOSE 3000

# Comando para iniciar el servidor de Next.js
CMD ["npm", "run", "start"]