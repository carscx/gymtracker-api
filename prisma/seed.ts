import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config'; // Aseguramos que lea el .env
import { BASE_ROUTINES } from '../src/common/data/base-routines.data';

// 1. Configurar conexión igual que en la App
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 2. Pasar el adaptador al cliente
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seeder desde la Fuente de la Verdad...');

  const uniqueExercises = new Map();

  BASE_ROUTINES.forEach((routine) => {
    routine.exercises.forEach((ex) => {
      if (!uniqueExercises.has(ex.name)) {
        uniqueExercises.set(ex.name, {
          name: ex.name,
          description: ex.description,
        });
      }
    });
  });

  console.log(`📝 Encontrados ${uniqueExercises.size} ejercicios únicos.`);

  for (const exercise of uniqueExercises.values()) {
    // Usamos upsert para no duplicar
    const exists = await prisma.exercise.findFirst({
      where: { name: exercise.name },
    });

    if (!exists) {
      await prisma.exercise.create({
        data: {
          name: exercise.name,
          description: exercise.description,
          isPublic: true,
          isApproved: true,
          creatorId: null,
        },
      });
    }
  }

  console.log('✅ Base de datos poblada correctamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // Cerramos también el pool de pg
  });
