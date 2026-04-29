import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from './faq.entity';

@Injectable()
export class FaqsService {
  constructor(
    @InjectRepository(Faq)
    private faqsRepository: Repository<Faq>,
  ) {}

  findAll(activeOnly = false) {
    const where = activeOnly ? { isActive: true } : {};
    return this.faqsRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async vote(id: number, type: 'like' | 'dislike', action: 'increment' | 'decrement') {
    const faq = await this.faqsRepository.findOne({ where: { id } });
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }

    if (type === 'like') {
      faq.likes = action === 'increment' ? faq.likes + 1 : Math.max(0, faq.likes - 1);
    } else {
      faq.dislikes = action === 'increment' ? faq.dislikes + 1 : Math.max(0, faq.dislikes - 1);
    }

    return this.faqsRepository.save(faq);
  }

  create(data: Partial<Faq>) {
    const faq = this.faqsRepository.create(data);
    return this.faqsRepository.save(faq);
  }

  async update(id: number, data: Partial<Faq>) {
    const faq = await this.faqsRepository.findOne({ where: { id } });
    if (!faq) throw new NotFoundException(`FAQ with ID ${id} not found`);
    Object.assign(faq, data);
    return this.faqsRepository.save(faq);
  }

  async remove(id: number) {
    const result = await this.faqsRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`FAQ with ID ${id} not found`);
    return { success: true };
  }
}
