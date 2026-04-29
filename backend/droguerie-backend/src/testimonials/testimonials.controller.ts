import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { Testimonial } from './testimonial.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
  findAll() {
    return this.testimonialsService.findAll();
  }

  @Get('active')
  findActive() {
    return this.testimonialsService.findActive();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() data: Partial<Testimonial>) {
    return this.testimonialsService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Partial<Testimonial>) {
    return this.testimonialsService.update(+id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testimonialsService.remove(+id);
  }
}
