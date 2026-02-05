import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
// import { AuthModule } from './auth/auth.module'; // Si ya lo creaste
import { AuthModule } from './auth/auth.module';
import { ExercisesModule } from './exercises/exercises.module';
import { RoutinesModule } from './routines/routines.module';
import { MeasurementsModule } from './measurements/measurements.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    // 1. Configuración Global (SIEMPRE PRIMERO)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Módulos de Features
    PrismaModule,
    UsersModule,
    AuthModule,
    ExercisesModule,
    RoutinesModule,
    MeasurementsModule,
    MailModule,
    // AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService], // <--- OJO: ¡AQUÍ NO DEBE ESTAR PrismaService!
})
export class AppModule {}
