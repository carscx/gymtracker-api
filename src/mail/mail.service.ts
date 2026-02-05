import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MailService {
  private readonly brevoUrl = 'https://api.brevo.com/v3/smtp/email';
  private readonly apiKey = process.env.BREVO_API_KEY;
  private readonly senderEmail = process.env.BREVO_SENDER_EMAIL;

  async sendPasswordResetEmail(to: string, token: string) {
    const resetLink = `gymtracker://auth/reset-password?token=${token}`;

    const htmlContent = `
      <h1>Recuperación de Contraseña</h1>
      <p>Toca el siguiente botón para abrir la app y cambiar tu contraseña:</p>
      <a href="${resetLink}" style="...">Abrir App y Restablecer</a>
      <p>Si el botón no funciona, copia y pega este enlace en tu navegador móvil (a veces ayuda a abrir la app): ${resetLink}</p>
    `;

    await this.sendEmail(
      to,
      'Recupera tu contraseña - GymTracker',
      htmlContent,
    );
  }

  async sendGoogleLoginReminder(to: string) {
    const htmlContent = `
      <h1>Recuperación de Contraseña</h1>
      <p>Vemos que intentaste recuperar tu contraseña, pero tu cuenta está vinculada a <strong>Google</strong>.</p>
      <p>Por favor, inicia sesión pulsando el botón de "Continuar con Google" en la pantalla de acceso.</p>
      <p>No necesitas una contraseña para entrar.</p>
    `;

    await this.sendEmail(
      to,
      'Recordatorio de inicio de sesión - GymTracker',
      htmlContent,
    );
  }

  // Método genérico privado para hablar con Brevo
  private async sendEmail(to: string, subject: string, htmlContent: string) {
    if (!this.apiKey || !this.senderEmail) {
      console.error('❌ Faltan las credenciales de BREVO en .env');
      return;
    }

    try {
      await axios.post(
        this.brevoUrl,
        {
          sender: { email: this.senderEmail, name: 'GymTracker App' },
          to: [{ email: to }],
          subject: subject,
          htmlContent: htmlContent,
        },
        {
          headers: {
            'api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log(`✅ Email enviado correctamente a ${to}`);
    } catch (error) {
      console.error(
        '❌ Error enviando email con Brevo:',
        error.response?.data || error.message,
      );
      // No lanzamos error para no romper el flujo del usuario (fail silent o log)
    }
  }
}
