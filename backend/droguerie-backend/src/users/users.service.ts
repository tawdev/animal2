import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email: userData.email } });
    if (existing) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    if (userData.password) {
      const salt = await bcrypt.genSalt();
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'fullName', 'role', 'isActive'],
    });
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Utilisateur #${id} introuvable`);
    }
    return user;
  }

  /** List all non-customer (admin/manager) users */
  async findAllAdminUsers(): Promise<User[]> {
    return this.userRepository.find({
      where: [
        { role: UserRole.ADMIN },
        { role: UserRole.STOCK_MANAGER },
        { role: UserRole.ORDER_MANAGER },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    const user = await this.findById(id);

    if (data.password) {
      const salt = await bcrypt.genSalt();
      data.password = await bcrypt.hash(data.password, salt);
    }

    Object.assign(user, data);
    return this.userRepository.save(user);
  }

  async delete(id: number, requestingUserId: number): Promise<void> {
    if (id === requestingUserId) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer votre propre compte');
    }
    const user = await this.findById(id);
    await this.userRepository.remove(user);
  }

  async toggleActive(id: number, requestingUserId: number): Promise<User> {
    if (id === requestingUserId) {
      throw new ForbiddenException('Vous ne pouvez pas désactiver votre propre compte');
    }
    const user = await this.findById(id);
    user.isActive = !user.isActive;
    return this.userRepository.save(user);
  }
}
