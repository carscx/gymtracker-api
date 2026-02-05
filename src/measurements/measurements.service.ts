import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MeasurementsService {
  constructor(private prisma: PrismaService) {}

  // Registrar peso
  async create(userId: string, data: Prisma.MeasurementCreateInput) {
    return this.prisma.measurement.create({
      data: {
        weight: parseFloat(data.weight as any),
        photoUrl: data.photoUrl, // Simple string (url) si suben foto
        note: data.note,
        date: data.date || new Date(),
        user: { connect: { id: userId } },
      },
    });
  }

  // Historial
  async findAll(userId: string) {
    return this.prisma.measurement.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  // Último registro (para ver el peso actual rápidamente)
  async findLatest(userId: string) {
    return this.prisma.measurement.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  // Borrar
  async remove(id: string, userId: string) {
    // Validar propiedad
    const count = await this.prisma.measurement.count({
      where: { id, userId },
    });
    if (count === 0) throw new Error('No encontrado');

    return this.prisma.measurement.delete({ where: { id } });
  }
}
