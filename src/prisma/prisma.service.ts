import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // 1. Creamos el pool de conexión con 'pg'
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // 2. Creamos el adaptador de Prisma
    const adapter = new PrismaPg(pool);

    // 3. Se lo pasamos a PrismaClient para satisfacer al motor WASM
    super({ adapter });
  }

  async onModuleInit() {
    console.log('🔍 DEBUG URL:', process.env.DATABASE_URL); // <--- MIRA ESTO EN LA CONSOLA
    await this.$connect();
  }
}
