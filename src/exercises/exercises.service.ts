import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  // Crear ejercicio (Vinculado al usuario creador)
  async create(userId: string, data: Prisma.ExerciseCreateInput) {
    const isPublicRequest = data.isPublic || false;

    return this.prisma.exercise.create({
      data: {
        ...data,
        creator: { connect: { id: userId } },
        // Si pide ser público, nace NO aprobado. Si es privado, nace aprobado.
        isApproved: !isPublicRequest,
        isPublic: isPublicRequest,
      },
    });
  }

  async approveExercise(id: string) {
    return this.prisma.exercise.update({
      where: { id },
      data: { isApproved: true },
    });
  }

  // Buscar TODOS (Globales + Los míos propios)
  async findAllForUser(userId: string) {
    return this.prisma.exercise.findMany({
      where: {
        OR: [
          { isPublic: true, isApproved: true }, // Globales APROBADOS
          { creatorId: userId }, // Mis ejercicios (privados o pendientes)
        ],
      },
      orderBy: { name: 'asc' },
    });
  }

  // Buscar uno solo (Verificando permisos)
  async findOne(id: string, userId: string) {
    const exercise = await this.prisma.exercise.findUnique({ where: { id } });

    // Si no existe, o es privado y no es mío -> null o error (aquí devolvemos null y el controller maneja 404)
    if (!exercise) return null;
    if (!exercise.isPublic && exercise.creatorId !== userId) return null;

    return exercise;
  }

  // Actualizar (Solo si es mío)
  async update(id: string, userId: string, data: Prisma.ExerciseUpdateInput) {
    // Primero verificamos que sea el dueño
    const count = await this.prisma.exercise.count({
      where: { id, creatorId: userId },
    });

    if (count === 0) {
      throw new Error(
        'No tienes permiso para editar este ejercicio o no existe',
      );
    }

    return this.prisma.exercise.update({
      where: { id },
      data,
    });
  }

  // Borrar (Solo si es mío)
  async remove(id: string, userId: string) {
    const count = await this.prisma.exercise.count({
      where: { id, creatorId: userId },
    });

    if (count === 0) {
      throw new Error('No tienes permiso para borrar este ejercicio');
    }

    return this.prisma.exercise.delete({ where: { id } });
  }
}
