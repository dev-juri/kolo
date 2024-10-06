import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { transactionType } from '../enums/transactionType.enum';
import { transactionStatus } from '../enums/transactionStatus.enum';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: transactionType,
    nullable: false,
  })
  type: transactionType;

  @Column({
    type: 'enum',
    enum: transactionStatus,
    default: transactionStatus.PENDING,
  })
  status?: transactionStatus;

  @Column({
    nullable: false,
    type: 'decimal',
  })
  amount: number;

  @Column({
    nullable: false,
    type: 'varchar',
    unique: true,
  })
  transaction_ref: string;

  @Column({
    nullable: false,
    type: 'varchar',
    unique: true,
  })
  access_code: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  update: Date;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  accountName?: string;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  accountNumber?: string;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  remarks?: string;

  @ManyToOne(() => User, (user) => user.transactions, {
    eager: true,
  })
  user: User;
}
