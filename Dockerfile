# --- ETAPA 1: Construcción (Builder) ---
FROM node:18-alpine AS builder

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias (incluyendo devDependencies para poder compilar)
RUN npm ci

# Generar cliente de Prisma
RUN npx prisma generate

# Copiar el resto del código fuente
COPY . .

# Compilar la aplicación (crea la carpeta dist)
RUN npm run build

# --- ETAPA 2: Producción (Runner) ---
FROM node:18-alpine

WORKDIR /app

# Copiar dependencias de producción solamente (para que la imagen pese menos)
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production

# Copiar el cliente de prisma generado y el código compilado desde la etapa anterior
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist

# Exponer el puerto
EXPOSE 3000

# Comando de inicio
CMD [ "node", "dist/src/main" ]