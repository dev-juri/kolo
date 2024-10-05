import { Module } from '@nestjs/common';
import { TransactionsService } from './providers/transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transactions.entity';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule } from '@nestjs/config';
import paystackConfig from 'src/config/paystack.config';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService],
  imports: [TypeOrmModule.forFeature([Transaction]), UsersModule, ConfigModule.forFeature(paystackConfig)]
})
export class TransactionsModule {}
