import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseIntPipe, UseGuards, Request
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** List all manager/admin accounts */
  @Get()
  findAll() {
    return this.usersService.findAllAdminUsers();
  }

  /** Create a new manager/admin account */
  @Post()
  create(@Body() body: {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
  }) {
    return this.usersService.create({
      fullName: body.fullName,
      email: body.email,
      password: body.password,
      role: body.role,
    });
  }

  /** Update a user (role, fullName, isActive, password) */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<{ fullName: string; role: UserRole; isActive: boolean; password: string }>,
  ) {
    return this.usersService.update(id, body);
  }

  /** Toggle active/inactive */
  @Patch(':id/toggle-active')
  toggleActive(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.usersService.toggleActive(id, req.user.userId);
  }

  /** Delete a user */
  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.usersService.delete(id, req.user.userId);
  }
}
