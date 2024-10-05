import { Module } from '@nestjs/common';
import { UsersService } from './providers/users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import paystackConfig from 'src/config/paystack.config';

@Module({
  controllers: [UsersController],
  providers: [UsersService, ConfigService],
  exports: [UsersService],
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule.forFeature(paystackConfig),
  ],
})
export class UsersModule {}
