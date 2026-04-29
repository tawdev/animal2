import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('inquiries')
export class Inquiry {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    subject: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ default: 'new' })
    status: 'new' | 'read' | 'replied' | 'archived';

    @CreateDateColumn()
    createdAt: Date;
}
