import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { TipsService } from './tips.service';
import { Tip } from './tip.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tips')
export class TipsController {
    constructor(private readonly tipsService: TipsService) {}

    @Get()
    findAll() {
        return this.tipsService.findAll();
    }

    @Get('active')
    findActive() {
        return this.tipsService.findActive();
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() data: Partial<Tip>) {
        return this.tipsService.create(data);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(@Param('id') id: string, @Body() data: Partial<Tip>) {
        return this.tipsService.update(+id, data);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(@Param('id') id: string) {
        return this.tipsService.remove(+id);
    }
}
