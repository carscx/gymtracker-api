import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('routines')
@UseGuards(AuthGuard('jwt'))
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Post()
  create(@Request() req, @Body() createRoutineDto: CreateRoutineDto) {
    return this.routinesService.create(req.user.userId, createRoutineDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.routinesService.findAll(req.user.userId);
  }

  // Endpoint especial: Ver historial (poner antes de :id para que no choque)
  @Get('history')
  getHistory(@Request() req) {
    return this.routinesService.getHistory(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.routinesService.findOne(id, req.user.userId);
  }

  @Post(':id/complete')
  completeRoutine(
    @Request() req,
    @Param('id') id: string,
    @Body('duration') duration: number,
  ) {
    return this.routinesService.logWorkout(id, req.user.userId, duration);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.routinesService.remove(id, req.user.userId);
  }
}
