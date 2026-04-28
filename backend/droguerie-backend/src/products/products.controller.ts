import { Controller, Get, Post, Body, Query, Param, Patch, Delete, NotFoundException, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    findAll(@Query() query: ProductQueryDto) {
        return this.productsService.findAll(
            query.page,
            query.limit,
            query.search,
            query.categoryId,
            query.brandId,
            query.minPrice,
            query.maxPrice,
            query.inStock,
            query.onSale,
            query.ecoFriendly,
            query.sort,
            query.active
        );
    }

    @Get('stats')
    getStats() {
        return this.productsService.getStats();
    }

    @Get('tags')
    getTags() {
        return this.productsService.getUniqueTags();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const product = await this.productsService.findOne(Number(id));
        if (!product) throw new NotFoundException(`Product with ID ${id} not found`);
        return product;
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    create(@Body() data: CreateProductDto) {
        return this.productsService.create(data);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async update(@Param('id') id: string, @Body() data: UpdateProductDto) {
        try {
            return await this.productsService.update(Number(id), data);
        } catch (err) {
            throw new NotFoundException(err.message);
        }
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(@Param('id') id: string) {
        return this.productsService.remove(Number(id));
    }
}
