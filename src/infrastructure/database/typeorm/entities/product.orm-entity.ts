import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CategoryOrmEntity } from './category.orm-entity';

@Entity('products')
export class ProductOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  sku!: string;

  @Column()
  categoryId!: string;

  @ManyToOne(() => CategoryOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoryId' })
  category!: CategoryOrmEntity;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column('int')
  stock!: number;

  @Column('int')
  minStock!: number;

  @Column()
  supplier!: string;

  @Column()
  createdAt!: Date;

  @Column()
  updatedAt!: Date;
}
