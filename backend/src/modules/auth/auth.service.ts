import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthResponeseDto, LoginDTO, UserResponseDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { JwtPayload } from './types/jwt-payload.interface';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  async validateUser(data: LoginDTO) {
    const user = await this.usersService.findByUsername(data.username);
    if (!user) {
      throw new Error('Invalid username or password');
    }
    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...result } = user;
    return result;
  }
  login(user: Omit<User, 'passwordHash'>): AuthResponeseDto {
    const payload: JwtPayload = {
      username: user.username,
      sub: user.id,
      role: user.role,
    };
    const access_token = this.jwtService.sign(payload);
    const userResponse: UserResponseDto = {
      id: user.id,
      username: user.username,
      role: user.role,
    };
    return {
      access_token,
      user: userResponse,
    };
  }
}
