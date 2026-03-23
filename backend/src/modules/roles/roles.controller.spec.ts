import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';

describe('RolesController', () => {
  let controller: RolesController;
  let findAllRoles: jest.Mock;
  let findRolesbyID: jest.Mock;

  const mockRole: Role = {
    id: 1,
    roleName: 'ADMIN',
    users: [],
  };

  beforeEach(async () => {
    findAllRoles = jest.fn();
    findRolesbyID = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: { findAllRoles, findRolesbyID } as unknown as RolesService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return all roles', async () => {
      findAllRoles.mockResolvedValue([mockRole] as Role[]);

      const result = await controller.findAll();

      expect(findAllRoles).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockRole]);
    });

    it('should return empty array when no roles exist', async () => {
      findAllRoles.mockResolvedValue([] as Role[]);

      const result = await controller.findAll();

      expect(result).toEqual([] as Role[]);
    });

    it('should propagate service error', async () => {
      findAllRoles.mockRejectedValue(new Error('Service error'));

      await expect(controller.findAll()).rejects.toThrow('Service error');
    });
  });

  describe('findOne', () => {
    it('should return a role by id', async () => {
      findRolesbyID.mockResolvedValue(mockRole);

      const result = await controller.findOne('1');

      expect(findRolesbyID).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockRole);
    });

    it('should return null when role not found', async () => {
      findRolesbyID.mockResolvedValue(null);

      const result = await controller.findOne('999');

      expect(findRolesbyID).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });

    it('should propagate service error', async () => {
      findRolesbyID.mockRejectedValue(new Error('Service error'));

      await expect(controller.findOne('1')).rejects.toThrow('Service error');
    });
  });
});
