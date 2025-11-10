import { sign, verify } from 'hono/jwt';
import type { JWTPayload } from 'hono/utils/jwt/types';
import type { TokenPayload } from '../../core/bootstrap';
import { timeToSeconds } from '../../core/helpers/timeToSeconds';
import { Service } from '../../core/lib/service.class';
import { log } from '../../core/log';
import { config } from '../config';
import type { UsersService } from './users.service';

export class AuthService extends Service {
  private async generateTokens(props: { id: string; username: string; email: string }): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload: JWTPayload = {
      userId: props.id,
      email: props.email,
      iat: Math.floor(Date.now() / 1000), // Creation date (seconds)
      nbf: Math.floor(Date.now() / 1000), // Valid since (now)
      exp: Math.floor(Date.now() / 1000) + timeToSeconds(config.auth.accessTokenExpires),
    };

    const accessToken = await sign(payload, config.auth.jwtSecret);
    const refreshToken = await sign(
      {
        ...payload,
        exp: Math.floor(Date.now() / 1000) + timeToSeconds(config.auth.refreshTokenExpires),
      },
      config.auth.jwtRefreshSecret,
    );

    return { accessToken, refreshToken };
  }

  async login(email: string, password: string) {
    const [user] = await this.services.get<UsersService>('UsersService').getUserByEmail(email);

    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await Bun.password.verify(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || '',
        role: user.role,
      },
      tokens,
    };
  }

  async signUp(email: string, name: string) {
    const usersService = this.services.get<UsersService>('UsersService');
    const [existingUser] = await usersService.getUserByEmail(email);

    if (existingUser) {
      log.ERROR(`Signup email already used by ${existingUser.id} `);
      throw new Error('Internal error');
    }

    const [newUser] = await usersService.createUser({ email, name, role: 'user' });

    return this.generateTokens(newUser);
  }

  async refreshToken(refreshToken: string) {
    const decoded = (await verify(refreshToken, config.auth.jwtRefreshSecret)) as TokenPayload;

    const [user] = await this.services.get<UsersService>('UsersService').getUserById(decoded.userId);

    if (!user) {
      log.ERROR(`User not found ${decoded.userId} during the refresh-token`);
      throw new Error('User not found');
    }

    return this.generateTokens(user);
  }

  async forgotPassword(email: string) {
    const usersService = this.services.get<UsersService>('UsersService');
    const [user] = await usersService.getUserByEmail(email);

    if (user) {
      const resetToken = Array.from(crypto.getRandomValues(new Uint8Array(20)), (byte) =>
        byte.toString(16).padStart(2, '0'),
      ).join('');
      const resetExpiration = new Date(Date.now() + 3600000); // 1 hora

      await usersService.setResetPasswordToken(user.id, resetToken, resetExpiration);

      // Aquí normalmente enviarías un email con el enlace para restablecer la contraseña
      // El enlace contendría el token: https://tuapp.com/reset-password?token=${resetToken}
    }

    return { message: 'Instructions sent to email' };
  }

  async resetPassword(token: string, newPassword: string) {
    const usersService = this.services.get<UsersService>('UsersService');
    const [user] = await usersService.getUserByResetToken(token);

    if (!user) {
      throw new Error('Invalid or expired token');
    }

    const hashedPassword = await Bun.password.hash(newPassword);

    await usersService.updateUserPassword(user.id, hashedPassword);
    await usersService.clearResetPasswordToken(user.id);

    return { message: 'Password updated successfully' };
  }

  async verifyAccessToken(token: string) {
    try {
      return (await verify(token, config.auth.jwtSecret)) as unknown as TokenPayload;
    } catch (error) {
      log.ERROR('Invalid or expired token', error);
      throw new Error('Invalid or expired token');
    }
  }
}
