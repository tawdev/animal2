import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogPost } from './blog-post.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('blog')
export class BlogController {
    constructor(private readonly blogService: BlogService) { }

    @Get()
    findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('tag') tag?: string,
        @Query('category') category?: string,
        @Query('sort') sort: 'recent' | 'oldest' = 'recent',
    ) {
        return this.blogService.findAll(Number(page), Number(limit), search, tag, category, sort);
    }

    @Get('tags')
    getPopularTags() {
        return this.blogService.getPopularTags();
    }

    @Get('categories/unique')
    getUniqueCategories() {
        return this.blogService.getUniqueCategories();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.blogService.findOne(+id);
    }

    @Get('slug/:slug')
    findBySlug(@Param('slug') slug: string) {
        return this.blogService.findBySlug(slug);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() data: Partial<BlogPost>) {
        return this.blogService.create(data);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(@Param('id') id: string, @Body() data: Partial<BlogPost>) {
        return this.blogService.update(+id, data);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(@Param('id') id: string) {
        return this.blogService.remove(+id);
    }
}
