import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('newsletter')
export class NewsletterController {
    constructor(private readonly newsletterService: NewsletterService) {}

    @Post('subscribe')
    subscribe(@Body('email') email: string) {
        return this.newsletterService.subscribe(email);
    }

    @Get('subscribers')
    @UseGuards(JwtAuthGuard)
    findAll() {
        return this.newsletterService.findAll();
    }

    @Get('stats')
    @UseGuards(JwtAuthGuard)
    getStats() {
        return this.newsletterService.getStats();
    }

    @Delete('subscribers/:id')
    @UseGuards(JwtAuthGuard)
    remove(@Param('id') id: string) {
        return this.newsletterService.remove(+id);
    }
}
