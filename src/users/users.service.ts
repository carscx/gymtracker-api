import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  // Necesario para el Auth
  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    // --- LOGS DE DEPURACIÓN ---
    console.log('🚨 DEBUG SERVICIO - ID RECIBIDO:', id);
    console.log('🚨 DEBUG SERVICIO - DATOS:', JSON.stringify(data));
    // -------------------------

    try {
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      // Capturamos el error P2025 (Registro no encontrado) para no devolver un 500
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`El usuario con ID ${id} no existe.`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`El usuario con ID ${id} no existe.`);
      }
      throw error;
    }
  }
}
