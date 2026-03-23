import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ObjectLiteral, FindOptionsWhere } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';

type MockRepo<T extends ObjectLiteral> = Partial<jest.Mocked<Repository<T>>>;

const createMockRepo = <T extends ObjectLiteral>(): MockRepo<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
});

// ✅ FIX: mock ให้ตรงกับ import * as bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcrypt') as { hash: jest.Mock };

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: MockRepo<User>;
  let roleRepo: MockRepo<Role>;

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

  beforeEach(async () => {
    userRepo = createMockRepo<User>();
    roleRepo = createMockRepo<Role>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Role), useValue: roleRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  // ──────────────────────────────────────────
  // createUser
  // ──────────────────────────────────────────
  describe('createUser', () => {
    const dto: CreateUserDto = {
      username: 'testuser',
      password: 'secret123',
      role: 1,
    };

    it('should hash password, find role, create and save user', async () => {
      roleRepo.findOne!.mockResolvedValue(mockRole);
      userRepo.create!.mockReturnValue(mockUser);
      userRepo.save!.mockResolvedValue(mockUser);

      const result = await service.createUser(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('secret123', 10);
      expect(roleRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 } as FindOptionsWhere<Role>,
      });
      expect(userRepo.create).toHaveBeenCalledWith({
        username: 'testuser',
        passwordHash: 'hashed_password',
        role: mockRole,
      });
      expect(userRepo.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should create user without role when dto.role is undefined', async () => {
      const dtoNoRole = {
        username: 'testuser',
        password: 'secret123',
      } as CreateUserDto;

      const userNoRole: User = {
        ...mockUser,
        role: undefined as unknown as Role,
      };

      userRepo.create!.mockReturnValue(userNoRole);
      userRepo.save!.mockResolvedValue(userNoRole);

      const result = await service.createUser(dtoNoRole);

      expect(roleRepo.findOne).not.toHaveBeenCalled();
      expect(userRepo.create).toHaveBeenCalledWith({
        username: 'testuser',
        passwordHash: 'hashed_password',
        role: undefined,
      });
      expect(result).toEqual(userNoRole);
    });

    it('should throw when userRepo.save fails', async () => {
      roleRepo.findOne!.mockResolvedValue(mockRole);
      userRepo.create!.mockReturnValue(mockUser);
      userRepo.save!.mockRejectedValue(new Error('DB error'));

      await expect(service.createUser(dto)).rejects.toThrow('DB error');
    });
  });

  // ──────────────────────────────────────────
  // findByUsername
  // ──────────────────────────────────────────
  describe('findByUsername', () => {
    it('should return user when found', async () => {
      userRepo.findOne!.mockResolvedValue(mockUser);

      const result = await service.findByUsername('testuser');

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' } as FindOptionsWhere<User>,
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      userRepo.findOne!.mockResolvedValue(null);

      const result = await service.findByUsername('unknown');

      expect(result).toBeNull();
    });
  });

  // ──────────────────────────────────────────
  // findAllUser
  // ──────────────────────────────────────────
  describe('findAllUser', () => {
    it('should return all users with role relation', async () => {
      const users: User[] = [mockUser];
      userRepo.find!.mockResolvedValue(users);

      const result = await service.findAllUser();

      expect(userRepo.find).toHaveBeenCalledWith({ relations: ['role'] });
      expect(result).toEqual(users);
    });

    it('should return empty array when no users exist', async () => {
      userRepo.find!.mockResolvedValue([] as User[]);

      const result = await service.findAllUser();

      expect(result).toEqual([] as User[]);
    });
  });

  // ──────────────────────────────────────────
  // findOne
  // ──────────────────────────────────────────
  describe('findOne', () => {
    it('should return user when found', async () => {
      userRepo.findOne!.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 } as FindOptionsWhere<User>,
        relations: ['role'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      userRepo.findOne!.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });
});
