import { IsNotEmpty, IsString } from 'class-validator';
import { Role } from 'src/modules/roles/entities/role.entity';

export class LoginDTO {
  @IsString()
  @IsNotEmpty()
  username: string;
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UserResponseDto {
  id: number;
  username: string;
  role: Role;
}
export class AuthResponeseDto {
  access_token: string;
  user: UserResponseDto;
}
