import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';

const mockRole: Role = { id: 1, roleName: 'admin' } as Role;

const mockUser: User = {
  id: 1,
  username: 'testuser',
  passwordHash: 'hashed_password',
  role: mockRole,
  createdAt: new Date(),
  updatedAt: new Date(),
  stockLogs: [],
  receipt: [],
  createdMedicines: [],
  updatedMedicines: [],
} as User;

const mockUsersService: Pick<
  jest.Mocked<UsersService>,
  'createUser' | 'findAllUser' | 'findOne'
> = {
  createUser: jest.fn(),
  findAllUser: jest.fn(),
  findOne: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => jest.clearAllMocks());

  // ──────────────────────────────────────────
  // POST /api/users
  // ──────────────────────────────────────────
  describe('create', () => {
    const dto: CreateUserDto = {
      username: 'testuser',
      password: 'secret123',
      role: 1,
    };

    it('should call createUser and return created user', async () => {
      mockUsersService.createUser.mockResolvedValue(mockUser);

      const result = await controller.create(dto);

      expect(mockUsersService.createUser).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUser);
    });

    it('should propagate error from service', async () => {
      mockUsersService.createUser.mockRejectedValue(new Error('DB error'));

      await expect(controller.create(dto)).rejects.toThrow('DB error');
    });
  });

  // ──────────────────────────────────────────
  // GET /api/users
  // ──────────────────────────────────────────
  describe('findAll', () => {
    it('should return array of users', async () => {
      const users: User[] = [mockUser];
      mockUsersService.findAllUser.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(mockUsersService.findAllUser).toHaveBeenCalled();
      expect(result).toEqual(users);
    });

    it('should return empty array when no users exist', async () => {
      mockUsersService.findAllUser.mockResolvedValue([] as User[]);

      const result = await controller.findAll();

      expect(result).toEqual([] as User[]);
    });
  });

  // ──────────────────────────────────────────
  // GET /api/users/:id
  // ──────────────────────────────────────────
  describe('findOne', () => {
    it('should call findOne with parsed numeric id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('1');

      expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('should propagate NotFoundException from service', async () => {
      mockUsersService.findOne.mockRejectedValue(
        new NotFoundException('User #999 not found'),
      );

      await expect(controller.findOne('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
