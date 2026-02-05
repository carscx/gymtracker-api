import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from '../users/dto/create-user.dto'; // Asegúrate de importar tu DTO si lo tienes

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // --- ENDPOINTS EXISTENTES ---

  @Post('login')
  async login(@Request() req) {
    // Nota: Aquí normalmente usarías un LocalAuthGuard antes,
    // pero si lo estás manejando manual, asegúrate de validar credenciales.
    // Para simplificar según tu flujo actual:
    const user = await this.authService.validateUser(
      req.body.email,
      req.body.password,
    );

    if (!user) {
      // AQUÍ ESTÁ EL CAMBIO:
      // Antes: throw new Error('Credenciales inválidas');  -> Esto daba 500
      // Ahora: throw new UnauthorizedException(...);       -> Esto da 401
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.authService.login(user);
  }

  // Si usas Passport Local Strategy, el login se ve así:
  /*
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
  */

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(
      createUserDto.email,
      createUserDto.password,
      createUserDto.name,
    );
  }

  @Post('google')
  async googleLogin(@Body('token') token: string) {
    return this.authService.loginWithGoogle(token);
  }

  // --- NUEVOS ENDPOINTS DE SEGURIDAD ---

  // 1. Cambiar contraseña (requiere estar logueado)
  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(@Request() req, @Body() body: any) {
    // body espera: { currentPassword, newPassword }
    return this.authService.changePassword(req.user.userId, body);
  }

  // 2. Cambiar email (requiere estar logueado)
  @Patch('change-email')
  @UseGuards(AuthGuard('jwt'))
  async changeEmail(@Request() req, @Body('email') email: string) {
    return this.authService.changeEmail(req.user.userId, email);
  }

  // 3. Olvidé mi contraseña (PÚBLICO)
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  // 4. Restablecer contraseña con token (PÚBLICO)
  @Post('reset-password')
  async resetPassword(@Body() body: any) {
    // body espera: { token, newPassword }
    return this.authService.resetPassword(body.token, body.newPassword);
  }
}
