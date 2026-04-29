import { Controller, Get, Patch, Param, Body, Post, Delete, Query } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { Faq } from './faq.entity';

@Controller('faqs')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Get()
  findAll(@Query('activeOnly') activeOnly?: string) {
    return this.faqsService.findAll(activeOnly === 'true');
  }

  @Post()
  create(@Body() data: Partial<Faq>) {
    return this.faqsService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Partial<Faq>) {
    return this.faqsService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.faqsService.remove(+id);
  }

  @Patch(':id/vote')
  vote(
    @Param('id') id: string,
    @Body('type') type: 'like' | 'dislike',
    @Body('action') action: 'increment' | 'decrement',
  ) {
    return this.faqsService.vote(+id, type, action);
  }
}
