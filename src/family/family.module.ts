import { Module } from '@nestjs/common';
import { FamilyService } from './providers/family.service';
import { FamilyController } from './family.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Family } from './entities/family.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [FamilyController],
  providers: [FamilyService],
  exports: [FamilyService],
  imports: [TypeOrmModule.forFeature([Family]), UsersModule]
})
export class FamilyModule {}
