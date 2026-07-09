import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductOrmEntity } from './product.orm-entity';

@Entity('inventory_movements')
export class InventoryMovementOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  productId!: string;

  @ManyToOne(() => ProductOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product!: ProductOrmEntity;

  @Column()
  type!: string;

  @Column('int')
  quantity!: number;

  @Column()
  reason!: string;

  @Column()
  createdAt!: Date;
}
