import { Role } from 'src/modules/roles/entities/role.entity';

export interface JwtPayload {
  sub: number;
  username: string;
  role: Role;
}
