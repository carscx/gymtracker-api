import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // 1. Especificamos el tipo <NestExpressApplication>
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 2. Habilitamos CORS (para que la app móvil no tenga problemas)
  app.enableCors();

  // 3. Servimos la carpeta 'uploads' como archivos estáticos públicos
  // Esto significa que si vas a http://localhost:3000/uploads/foto.jpg, la verás.
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
