jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));
import * as bcrypt from 'bcrypt';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { StockLog } from '../stock-logs/entities/stock-log.entity';
import { Receipt } from '../receipts/entities/receipt.entity';
import { Medicine } from '../medicines/entities/medicine.entity';

import { LoginDTO, AuthResponeseDto } from './dto/auth.dto';
import { JwtPayload } from './types/jwt-payload.interface';

const mockRole = (overrides: Partial<Role> = {}): Role => ({
  id: 1,
  roleName: 'admin',
  users: [] as User[],
  ...overrides,
});

const mockUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  username: 'admin',
  passwordHash: '$2b$10$hashedpassword',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  role: mockRole(),
  stockLogs: [] as StockLog[],
  receipt: [] as Receipt[],
  createdMedicines: [] as Medicine[],
  updatedMedicines: [] as Medicine[],
  ...overrides,
});

// ─── AuthService ──────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findByUsername: jest.Mock };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: { findByUsername: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => jest.clearAllMocks());

  // validateUser ----------------------------------------------------------------

  describe('validateUser', () => {
    const dto: LoginDTO = { username: 'Admin', password: 'secret' };

    it('should return user without passwordHash when credentials are valid', async () => {
      const user = mockUser({ username: 'admin' });
      usersService.findByUsername.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(dto);

      expect(usersService.findByUsername).toHaveBeenCalledWith('admin');
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.username).toBe('admin');
    });

    it('should throw Error when user is not found', async () => {
      usersService.findByUsername.mockResolvedValue(null);

      await expect(service.validateUser(dto)).rejects.toThrow(
        'Invalid username or password',
      );
    });

    it('should throw Error when password is invalid', async () => {
      const user = mockUser();
      usersService.findByUsername.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser(dto)).rejects.toThrow(
        'Invalid username or password',
      );
    });
  });

  // login -----------------------------------------------------------------------

  describe('login', () => {
    it('should return access_token and user response', () => {
      const user = mockUser();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _, ...userWithoutHash } = user;
      jwtService.sign.mockReturnValue('signed-token');

      const result = service.login(userWithoutHash);

      expect(jwtService.sign).toHaveBeenCalledWith({
        username: user.username,
        sub: user.id,
        role: user.role,
      } as JwtPayload);
      expect(result.access_token).toBe('signed-token');
      expect(result.user).toEqual({
        id: user.id,
        username: user.username,
        role: user.role,
      });
    });

    it('should return correct AuthResponeseDto shape', () => {
      const user = mockUser();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _, ...userWithoutHash } = user;
      jwtService.sign.mockReturnValue('token-xyz');

      const result: AuthResponeseDto = service.login(userWithoutHash);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('username');
      expect(result.user).toHaveProperty('role');
    });
  });
});
