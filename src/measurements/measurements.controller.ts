import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { AuthGuard } from '@nestjs/passport';
import { Prisma } from '@prisma/client';

@Controller('measurements')
@UseGuards(AuthGuard('jwt'))
export class MeasurementsController {
  constructor(private readonly measurementsService: MeasurementsService) {}

  @Post()
  create(@Request() req, @Body() data: Prisma.MeasurementCreateInput) {
    // Validación básica
    if (!data.weight) {
      throw new BadRequestException('El peso es obligatorio');
    }
    return this.measurementsService.create(req.user.userId, data);
  }

  @Get()
  findAll(@Request() req) {
    return this.measurementsService.findAll(req.user.userId);
  }

  @Get('latest')
  findLatest(@Request() req) {
    return this.measurementsService.findLatest(req.user.userId);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.measurementsService.remove(id, req.user.userId);
  }
}
