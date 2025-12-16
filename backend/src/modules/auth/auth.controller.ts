import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponeseDto, LoginDTO } from './dto/auth.dto';
// import * as bcrypt from 'bcrypt';
@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDTO): Promise<AuthResponeseDto> {
    const user = await this.authService.validateUser(loginDto);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return this.authService.login(user);
  }

  // @Post('hash-password')
  // async hashPassword(@Body() loginDto: LoginDTO) {
  //   // const { password } = body;
  //   console.log(loginDto.password);
  //   const saltRounds = 10;
  //   const passwordHash = await bcrypt.hash(loginDto.password, saltRounds);

  //   return { passwordHash };
  // }
}
