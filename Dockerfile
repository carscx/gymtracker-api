# --- ETAPA 1: Construcción (Builder) ---
# CAMBIO AQUÍ: Usamos Node 22 en lugar de 18
FROM node:22-alpine AS builder

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci

# Generar cliente de Prisma
RUN npx prisma generate

# Copiar el resto del código fuente
COPY . .

# Compilar la aplicación
RUN npm run build

# --- ETAPA 2: Producción (Runner) ---
# CAMBIO AQUÍ: También usamos Node 22 aquí
FROM node:22-alpine

WORKDIR /app

# Copiar dependencias de producción solamente
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production

# Copiar el cliente de prisma generado y el código compilado
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist

# Exponer el puerto
EXPOSE 3000

# Comando de inicio
CMD [ "npm", "run", "start:prod" ]