import { Transaction } from 'src/transactions/entities/transactions.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm';

@Entity()
export class Family {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  familyCode: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', default: 0 })
  balance: number;

  @Column({type: 'numeric', nullable: false})
  ownerId: number; 

  @OneToMany(() => User, (user) => user.family)
  users: User[];

  @OneToMany(() => Transaction, (transaction) => transaction.family)
  transactions: Transaction[];
}

