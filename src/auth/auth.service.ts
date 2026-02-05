import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service'; // <--- Importamos MailService
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcrypt';
import { BASE_ROUTINES } from '../common/data/base-routines.data';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private mailService: MailService, // <--- Inyectamos MailService
  ) {}

  // --- LOGIN Y REGISTRO EXISTENTES ---

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && user.password) {
      const isMatch = await bcrypt.compare(pass, user.password);
      if (isMatch) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async register(email: string, pass: string, name: string) {
    const existing = await this.usersService.findOneByEmail(email);
    if (existing) {
      throw new BadRequestException('El usuario ya existe');
    }
    const hashedPassword = await bcrypt.hash(pass, 10);
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      name,
    });

    await this.assignBaseRoutines(user.id);
    return this.login(user);
  }

  async loginWithGoogle(token: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    // 1. Guardamos el payload en una variable
    const payload = ticket.getPayload();

    // 2. Verificamos que exista y que tenga el email (que es obligatorio para nosotros)
    if (!payload || !payload.email) {
      throw new BadRequestException(
        'Token de Google inválido o falta el email',
      );
    }

    // 3. Ahora sí, TypeScript sabe que 'payload' existe y es seguro usarlo
    const { email, name, picture, sub } = payload;

    let user = await this.usersService.findOneByEmail(email);

    if (!user) {
      user = await this.usersService.create({
        email,
        name: name || 'Usuario Google', // name es opcional en Google, ponemos un default
        googleId: sub,
        avatarUrl: picture,
      });
      await this.assignBaseRoutines(user.id);
    } else if (!user.googleId) {
      user = await this.usersService.update(user.id, {
        googleId: sub,
        avatarUrl: user.avatarUrl || picture,
      });
    }

    return this.login(user);
  }

  // --- NUEVAS FUNCIONALIDADES DE SEGURIDAD ---

  // 1. Cambiar contraseña (Estando logueado)
  async changePassword(userId: string, dto: any) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new UnauthorizedException();

    // Si es usuario Google puro, no tiene password
    if (!user.password) {
      throw new BadRequestException(
        'Esta cuenta usa Google. No tiene contraseña para cambiar.',
      );
    }

    // Verificar contraseña actual
    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch)
      throw new UnauthorizedException('La contraseña actual es incorrecta');

    // Hashear y guardar nueva
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    return this.usersService.update(userId, { password: hashedPassword });
  }

  // 2. Cambiar Email (Estando logueado)
  async changeEmail(userId: string, newEmail: string) {
    const existing = await this.usersService.findOneByEmail(newEmail);
    // Si existe y no soy yo mismo
    if (existing && existing.id !== userId) {
      throw new BadRequestException('Este email ya está en uso');
    }
    return this.usersService.update(userId, { email: newEmail });
  }

  // 3. Olvidé mi contraseña (Público -> Envía Email)
  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email);

    // SEGURIDAD: Siempre devolvemos OK para no revelar si el email existe
    if (!user) {
      return { message: 'Si el correo existe, recibirás instrucciones.' };
    }

    // CASO GOOGLE: Recordatorio
    if (!user.password && user.googleId) {
      await this.mailService.sendGoogleLoginReminder(email);
      return { message: 'Si el correo existe, recibirás instrucciones.' };
    }

    // CASO EMAIL/PASS: Token de recuperación (15 min validez)
    // "purpose" asegura que este token no sirva para loguearse, solo para resetear
    const payload = { sub: user.id, purpose: 'reset_password' };
    const token = this.jwtService.sign(payload, { expiresIn: '15m' });

    // Enviamos el mail real con Brevo
    await this.mailService.sendPasswordResetEmail(email, token);

    return { message: 'Si el correo existe, recibirás instrucciones.' };
  }

  // 4. Restablecer contraseña (Público pero requiere Token válido)
  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);

      if (payload.purpose !== 'reset_password') {
        throw new UnauthorizedException('Token inválido para esta operación');
      }

      const userId = payload.sub;
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.usersService.update(userId, { password: hashedPassword });

      return { message: 'Contraseña actualizada correctamente' };
    } catch (error) {
      throw new UnauthorizedException('El enlace ha expirado o es inválido');
    }
  }

  // --- MÉTODOS PRIVADOS ---

  private async assignBaseRoutines(userId: string) {
    const allGlobalExercises = await this.prisma.exercise.findMany({
      where: { isPublic: true, isApproved: true },
    });

    for (const routineTemplate of BASE_ROUTINES) {
      await this.prisma.routine.create({
        data: {
          name: routineTemplate.name,
          userId: userId,
          exercises: {
            create: routineTemplate.exercises
              .map((exTemplate, index) => {
                const dbExercise = allGlobalExercises.find(
                  (e) => e.name === exTemplate.name,
                );
                if (!dbExercise) return null;

                return {
                  exerciseId: dbExercise.id,
                  sets: exTemplate.sets,
                  reps: exTemplate.reps,
                  order: index + 1,
                };
              })
              .filter((x) => x !== null) as any,
          },
        },
      });
    }
  }
}
