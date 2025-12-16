import { Controller, Get, Body, Param } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('/api/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll() {
    return this.rolesService.findAllRoles();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findRolesbyID(+id);
  }
}
