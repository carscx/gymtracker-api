import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { Prisma } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport'; // Usamos el guard de passport-jwt

@Controller('exercises')
@UseGuards(AuthGuard('jwt')) // <--- ¡CANDADO PUESTO A TODO EL CONTROLADOR!
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Post()
  create(
    @Request() req,
    @Body() createExerciseDto: Prisma.ExerciseCreateInput,
  ) {
    // req.user viene del JwtStrategy (userId, email)
    return this.exercisesService.create(req.user.userId, createExerciseDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.exercisesService.findAllForUser(req.user.userId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const exercise = await this.exercisesService.findOne(id, req.user.userId);
    if (!exercise)
      throw new NotFoundException('Ejercicio no encontrado o sin acceso');
    return exercise;
  }

  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateExerciseDto: Prisma.ExerciseUpdateInput,
  ) {
    try {
      return await this.exercisesService.update(
        id,
        req.user.userId,
        updateExerciseDto,
      );
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    try {
      return await this.exercisesService.remove(id, req.user.userId);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }

  @Patch(':id/approve')
  // @UseGuards(RolesGuard) <-- Aquí deberías poner un guard de Admin en el futuro
  async approve(@Param('id') id: string) {
    return this.exercisesService.approveExercise(id);
  }
}
