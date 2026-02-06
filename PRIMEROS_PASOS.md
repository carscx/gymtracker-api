# GymTracker API - Desarrollo Local 🏋️‍♂️

## 1. Primeros pasos (Solo la primera vez)

1. Copia las variables de entorno:
   `cp .env.example .env`
2. Instala dependencias:
   `npm install`

## 2. Iniciar el entorno (Día a día)

Para levantar la base de datos y rellenarla con datos de prueba automáticamente:

> npm run init:local

## 3. Arrancar la App

> npm run start:dev

## 4. ¿Rompiste la base de datos?

Si hiciste un lío con los datos y quieres empezar de cero (borrar todo y volver a seedear):

> npm run prisma:reset
