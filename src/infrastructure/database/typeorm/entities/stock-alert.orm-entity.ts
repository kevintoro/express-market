import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductOrmEntity } from './product.orm-entity';

@Entity('stock_alerts')
export class StockAlertOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  productId!: string;

  @ManyToOne(() => ProductOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product!: ProductOrmEntity;

  @Column()
  type!: string;

  @Column()
  status!: string;

  @Column()
  triggeredAt!: Date;

  @Column({ nullable: true })
  resolvedAt?: Date;
}
