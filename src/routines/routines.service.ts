import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoutineDto } from './dto/create-routine.dto';

@Injectable()
export class RoutinesService {
  constructor(private prisma: PrismaService) {}

  // 1. Crear Rutina con sus ejercicios configurados
  async create(userId: string, createRoutineDto: CreateRoutineDto) {
    const { name, exercises } = createRoutineDto;

    return this.prisma.routine.create({
      data: {
        name,
        userId,
        exercises: {
          create: exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            order: ex.order,
          })),
        },
      },
      include: { exercises: true }, // Devolvemos la rutina con los ejercicios creados
    });
  }

  // 2. Listar mis rutinas
  async findAll(userId: string) {
    return this.prisma.routine.findMany({
      where: { userId },
      include: {
        exercises: {
          include: { exercise: true }, // Incluimos el nombre/detalle del ejercicio
          orderBy: { order: 'asc' }, // Ordenados como el usuario quiere
        },
      },
    });
  }

  // 3. Ver detalle de una rutina
  async findOne(id: string, userId: string) {
    const routine = await this.prisma.routine.findUnique({
      where: { id },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!routine) throw new NotFoundException('Rutina no encontrada');
    if (routine.userId !== userId)
      throw new ForbiddenException('No tienes acceso a esta rutina');

    return routine;
  }

  // 4. Borrar rutina
  async remove(id: string, userId: string) {
    // Verificamos propiedad primero
    await this.findOne(id, userId);

    // Prisma borra en cascada los RoutineExercise gracias al esquema,
    // pero la rutina es lo principal.
    return this.prisma.routine.delete({ where: { id } });
  }

  // 5. Registrar que completé una rutina (Historial)
  async logWorkout(routineId: string, userId: string, duration: number) {
    // Verificamos que la rutina exista y sea mía
    await this.findOne(routineId, userId);

    return this.prisma.workoutHistory.create({
      data: {
        routineId,
        duration, // Duración en segundos/minutos, lo que decidas en el front
        date: new Date(),
      },
    });
  }

  // 6. Ver mi historial de entrenamientos
  async getHistory(userId: string) {
    return this.prisma.workoutHistory.findMany({
      where: {
        routine: { userId }, // Historial de rutinas que me pertenecen
      },
      include: { routine: true },
      orderBy: { date: 'desc' },
    });
  }
}
