import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'El email no es válido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @IsOptional()
  @IsString()
  @IsIn(['light', 'dark', 'system'], { message: 'El tema debe ser light, dark o system' })
  theme?: string;
}
