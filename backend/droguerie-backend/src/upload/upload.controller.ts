import { Controller, Post, UseInterceptors, UploadedFile, UploadedFiles, BadRequestException, Req, UseGuards, Body } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Use process.cwd() to get the project root accurately
const UPLOADS_DIR = join(process.cwd(), 'uploads');

// Ensure the directory exists
mkdirSync(UPLOADS_DIR, { recursive: true });

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
    @Post()
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: UPLOADS_DIR,
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, callback) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                    return callback(new BadRequestException('Only image files are allowed!'), false);
                }
                callback(null, true);
            },
            limits: {
                fileSize: 50 * 1024 * 1024, // 50MB limit
            },
        }),
    )
    uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        const url = `/uploads/${file.filename}`;
        console.log(`[Upload] File saved. Returning relative URL: ${url}`);

        return {
            url,
            filename: file.filename,
        };
    }

    @Post('multiple')
    @UseInterceptors(
        FilesInterceptor('files', 10, {
            storage: diskStorage({
                destination: UPLOADS_DIR,
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, callback) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                    return callback(new BadRequestException('Only image files are allowed!'), false);
                }
                callback(null, true);
            },
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB limit
            },
        }),
    )
    uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
        if (!files || files.length === 0) {
            throw new BadRequestException('Files are required');
        }

        return files.map(file => ({
            url: `/uploads/${file.filename}`,
            filename: file.filename,
        }));
    }

    @Post('remove-bg')
    @Post('removebg')
    @UseInterceptors(
        FileInterceptor('file', {
            limits: { fileSize: 50 * 1024 * 1024 },
        }),
    )
    async removeBackground(
        @UploadedFile() file?: Express.Multer.File,
        @Body('imageUrl') imageUrl?: string,
    ) {
        const apiKey = process.env.CLIPDROP_API_KEY || 'xVHYp98s5nQWp3vsUZcRZNBF';

        let imageBuffer: Buffer;
        let originalName = 'image.png';

        if (file) {
            imageBuffer = file.buffer;
            originalName = file.originalname;
        } else if (imageUrl) {
            try {
                if (imageUrl.startsWith('/uploads/')) {
                    const localPath = join(process.cwd(), imageUrl);
                    if (existsSync(localPath)) {
                        imageBuffer = readFileSync(localPath);
                    } else {
                        throw new BadRequestException('Local image file not found');
                    }
                } else {
                    const res = await fetch(imageUrl);
                    if (!res.ok) throw new Error('Failed to fetch image from URL');
                    imageBuffer = Buffer.from(await res.arrayBuffer());
                }
            } catch (err: any) {
                throw new BadRequestException(`Could not read image URL: ${err.message}`);
            }
        } else {
            throw new BadRequestException('Either image file or imageUrl must be provided');
        }

        try {
            const formData = new FormData();
            const blob = new Blob([new Uint8Array(imageBuffer)], { type: 'image/png' });
            formData.append('image_file', blob, originalName);

            let apiRes = await fetch('https://clipdrop-api.co/remove-background/v1', {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                },
                body: formData,
            });

            if (!apiRes.ok) {
                console.warn(`Clipdrop API returned status ${apiRes.status}, trying remove.bg API...`);
                const removeBgFormData = new FormData();
                removeBgFormData.append('image_file', blob, originalName);

                apiRes = await fetch('https://api.remove.bg/v1.0/removebg', {
                    method: 'POST',
                    headers: {
                        'X-Api-Key': apiKey,
                    },
                    body: removeBgFormData,
                });
            }

            if (!apiRes.ok) {
                const errText = await apiRes.text();
                console.error('Background removal API error:', errText);
                throw new BadRequestException(`API error (${apiRes.status}): ${errText}`);
            }

            const resultBuffer = Buffer.from(await apiRes.arrayBuffer());
            const filename = `bg-removed-${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;
            const filePath = join(UPLOADS_DIR, filename);

            writeFileSync(filePath, resultBuffer);

            const url = `/uploads/${filename}`;
            console.log(`[Upload] Background removed image saved: ${url}`);

            return {
                url,
                filename,
            };
        } catch (err: any) {
            console.error('Remove background error:', err);
            throw new BadRequestException(err.message || 'Failed to remove background from image');
        }
    }
}
