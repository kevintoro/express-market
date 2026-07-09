import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductOrmEntity } from './product.orm-entity';

@Entity('purchase_orders')
export class PurchaseOrderOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  productId!: string;

  @ManyToOne(() => ProductOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'productId' })
  product!: ProductOrmEntity;

  @Column()
  supplier!: string;

  @Column('int')
  quantity!: number;

  @Column()
  status!: string;

  @Column({ nullable: true })
  rejectionReason?: string;

  @Column()
  createdAt!: Date;

  @Column()
  updatedAt!: Date;
}
