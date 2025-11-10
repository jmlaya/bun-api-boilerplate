import { generateRandomText } from '../../core/helpers/generateRandomText';
import { Service } from '../../core/lib/service.class';
import type { AuthService } from './auth.service';

interface UserDTO {
  id: string;
  name: string;
  role: string;
  email: string;
  password: string;
  resetPasswordToken?: string;
  resetPasswordExpiration?: Date;
}

export class UsersService extends Service {
  public getUsers() {
    return this.sql`SELECT id, name, email, role, created_at, updated_at FROM users`;
  }

  public getUserById(userId: string) {
    return this.sql`SELECT * FROM users WHERE id = ${userId}`;
  }

  public getUserByEmail(email: string) {
    return this.sql`SELECT * FROM users WHERE email = ${email}`;
  }

  public async createUser(user: Omit<UserDTO, 'id' | 'resetPasswordToken' | 'resetPasswordExpiration' | 'password'>) {
    const hashedPassword = await Bun.password.hash(generateRandomText(12));

    const newUser = await this.sql`
      INSERT INTO users (name, role, email, password)
      VALUES (${user.name}, ${user.role}, ${user.email}, ${hashedPassword})
      RETURNING id, email, created_at
    `;

    await this.services.get<AuthService>('AuthService').forgotPassword(user.email);

    return newUser;
  }

  public async updateUser(
    user: Omit<UserDTO, 'resetPasswordToken' | 'resetPasswordExpiration' | 'email' | 'password'>,
  ) {
    return this.sql`
      UPDATE users
      SET name = ${user.name}, role = ${user.role}
      WHERE id = ${user.id}
    `;
  }

  public updateUserPassword(userId: string, hashedPassword: string) {
    return this.sql`
      UPDATE users
      SET password = ${hashedPassword}
      WHERE id = ${userId}
    `;
  }

  public setResetPasswordToken(userId: string, token: string, expiration: Date) {
    return this.sql`
      UPDATE users
      SET reset_password_token = ${token}, reset_password_expiration = ${expiration}
      WHERE id = ${userId}
    `;
  }

  public getUserByResetToken(token: string) {
    return this.sql`
      SELECT * FROM users 
      WHERE reset_password_token = ${token} 
      AND reset_password_expiration > NOW()
    `;
  }

  public clearResetPasswordToken(userId: string) {
    return this.sql`
      UPDATE users
      SET reset_password_token = NULL, reset_password_expiration = NULL
      WHERE id = ${userId}
    `;
  }
}
