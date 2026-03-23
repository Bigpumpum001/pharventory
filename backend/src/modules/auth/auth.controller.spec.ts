import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';

import { AuthService } from './auth.service';

import { LoginDTO, AuthResponeseDto } from './dto/auth.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { StockLog } from '../stock-logs/entities/stock-log.entity';
import { Receipt } from '../receipts/entities/receipt.entity';
import { Medicine } from '../medicines/entities/medicine.entity';

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
describe('AuthController', () => {
  let controller: AuthController;
  let authService: { validateUser: jest.Mock; login: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: { validateUser: jest.fn(), login: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('login', () => {
    const dto: LoginDTO = { username: 'admin', password: 'secret' };

    it('should return auth response when credentials are valid', async () => {
      const user = mockUser();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _, ...userWithoutHash } = user;
      const authResponse: AuthResponeseDto = {
        access_token: 'token',
        user: { id: 1, username: 'admin', role: mockRole() },
      };

      authService.validateUser.mockResolvedValue(userWithoutHash);
      authService.login.mockReturnValue(authResponse);

      const result = await controller.login(dto);

      expect(authService.validateUser).toHaveBeenCalledWith(dto);
      expect(authService.login).toHaveBeenCalledWith(userWithoutHash);
      expect(result).toEqual(authResponse);
    });

    it('should throw HttpException UNAUTHORIZED when validateUser returns null', async () => {
      authService.validateUser.mockResolvedValue(null);

      await expect(controller.login(dto)).rejects.toThrow(
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED),
      );
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should propagate error thrown by validateUser', async () => {
      authService.validateUser.mockRejectedValue(
        new Error('Invalid username or password'),
      );

      await expect(controller.login(dto)).rejects.toThrow(
        'Invalid username or password',
      );
      expect(authService.login).not.toHaveBeenCalled();
    });
  });
});
