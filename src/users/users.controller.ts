import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  Request,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ==================================================
  // 1. ENDPOINTS ESPECÍFICOS (Siempre van primero)
  // ==================================================

  // --- SUBIR AVATAR ---
  @Post('avatar')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `avatar-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(
            new BadRequestException(
              'Solo se permiten imágenes (jpg, jpeg, png, gif)',
            ),
            false,
          );
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se subió ningún archivo');
    }

    // Construir URL pública
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${serverUrl}/uploads/${file.filename}`;

    // Actualizar usuario
    return this.usersService.update(req.user.userId, {
      avatarUrl: fileUrl,
    });
  }

  // --- ACTUALIZAR MI PERFIL (Nombre, Tema, etc.) ---
  @Patch('profile')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(@Request() req, @Body() body: any) {
    console.log(
      '✅ CONTROLADOR - updateProfile llamado por User ID:',
      req.user.userId,
    );
    // IMPORTANTE: Aquí pasamos req.user.userId, que es el UUID real
    return this.usersService.update(req.user.userId, body);
  }

  // ==================================================
  // 2. ENDPOINTS GENÉRICOS (Van al final)
  // ==================================================

  @Post()
  create(@Body() createUserDto: Prisma.UserCreateInput) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: Prisma.UserUpdateInput,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
