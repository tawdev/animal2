import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquiry } from './inquiry.entity';

@Injectable()
export class InquiriesService {
    constructor(
        @InjectRepository(Inquiry)
        private readonly inquiryRepository: Repository<Inquiry>,
    ) { }

    async create(data: { name: string; email: string; subject: string; message: string }): Promise<Inquiry> {
        const inquiry = this.inquiryRepository.create(data);
        return this.inquiryRepository.save(inquiry);
    }

    async findAll(): Promise<Inquiry[]> {
        return this.inquiryRepository.find({ order: { createdAt: 'DESC' } });
    }

    async findOne(id: number): Promise<Inquiry> {
        const inquiry = await this.inquiryRepository.findOne({ where: { id } });
        if (!inquiry) {
            throw new NotFoundException(`Inquiry with ID ${id} not found`);
        }
        return inquiry;
    }

    async updateStatus(id: number, status: 'new' | 'read' | 'replied' | 'archived'): Promise<Inquiry> {
        const inquiry = await this.findOne(id);
        inquiry.status = status;
        return this.inquiryRepository.save(inquiry);
    }

    async remove(id: number): Promise<void> {
        const result = await this.inquiryRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Inquiry with ID ${id} not found`);
        }
    }
}
