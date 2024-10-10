import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { FamilyService } from './providers/family.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { JoinFamilyDto, UpdateFamilyDto } from './dto/update-family.dto';
import { TransactionDto } from 'src/transactions/dtos/transaction.dto';

@Controller('family')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post('create/:userId')
  createFamily(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateFamilyDto,
  ) {
    return this.familyService.createFamily(dto, userId);
  }

  @Post('join/:userId')
  joinFamily(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: JoinFamilyDto,
  ) {
    return this.familyService.joinFamily(dto, userId);
  }
}

