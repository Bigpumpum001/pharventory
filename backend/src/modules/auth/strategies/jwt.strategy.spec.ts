import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { JwtPayload } from '../types/jwt-payload.interface';
import { Role } from 'src/modules/roles/entities/role.entity';
import { User } from 'src/modules/users/entities/user.entity';

const mockRole = (overrides: Partial<Role> = {}): Role => ({
  id: 1,
  roleName: 'admin',
  users: [] as User[],
  ...overrides,
});

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('validate', () => {
    it('should return sub, username, and role from payload', () => {
      const payload: JwtPayload = {
        sub: 1,
        username: 'admin',
        role: mockRole(),
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        sub: 1,
        username: 'admin',
        role: mockRole(),
      });
    });

    it('should return role as-is from payload', () => {
      const role = mockRole({ id: 2, roleName: 'nurse' });
      const payload: JwtPayload = { sub: 5, username: 'nurse01', role };

      const result = strategy.validate(payload);

      expect(result.role).toEqual(role);
      expect(result.sub).toBe(5);
      expect(result.username).toBe('nurse01');
    });
  });
});
