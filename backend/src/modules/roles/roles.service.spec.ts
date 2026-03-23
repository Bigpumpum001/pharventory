import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';

type MockRepo<T extends ObjectLiteral> = Partial<jest.Mocked<Repository<T>>>;

function createMockRepo<T extends ObjectLiteral>(): MockRepo<T> {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
  };
}

describe('RolesService', () => {
  let service: RolesService;
  let roleRepo: MockRepo<Role>;

  const mockRole: Role = {
    id: 1,
    roleName: 'ADMIN',
    users: [],
  };

  beforeEach(async () => {
    roleRepo = createMockRepo<Role>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getRepositoryToken(Role),
          useValue: roleRepo,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── findAllRoles ───────────────────────────────────────────────

  describe('findAllRoles', () => {
    it('should return all roles', async () => {
      (roleRepo.find as jest.Mock).mockResolvedValue([mockRole] as Role[]);

      const result = await service.findAllRoles();

      expect(roleRepo.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockRole]);
    });

    it('should return empty array when no roles exist', async () => {
      (roleRepo.find as jest.Mock).mockResolvedValue([] as Role[]);

      const result = await service.findAllRoles();

      expect(result).toEqual([]);
    });

    it('should propagate repository error', async () => {
      (roleRepo.find as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(service.findAllRoles()).rejects.toThrow('DB error');
    });
  });

  // ─── findRolesbyID ──────────────────────────────────────────────

  describe('findRolesbyID', () => {
    it('should return a role by id', async () => {
      (roleRepo.findOne as jest.Mock).mockResolvedValue(mockRole);

      const result = await service.findRolesbyID(1);

      expect(roleRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockRole);
    });

    it('should return null when role not found', async () => {
      (roleRepo.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.findRolesbyID(999);

      expect(roleRepo.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(result).toBeNull();
    });

    it('should propagate repository error', async () => {
      (roleRepo.findOne as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(service.findRolesbyID(1)).rejects.toThrow('DB error');
    });
  });
});
