import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InquiriesService } from './inquiries.service';

@Controller('inquiries')
export class InquiriesController {
    constructor(private readonly inquiriesService: InquiriesService) { }

    @Post()
    create(@Body() data: { name: string; email: string; subject: string; message: string }) {
        return this.inquiriesService.create(data);
    }

    @Get()
    findAll() {
        return this.inquiriesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.inquiriesService.findOne(+id);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: 'new' | 'read' | 'replied' | 'archived') {
        return this.inquiriesService.updateStatus(+id, status);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.inquiriesService.remove(+id);
    }
}
