import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { FamilyService } from './providers/family.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { JoinFamilyDto } from './dto/update-family.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Family')
@Controller('family')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @ApiOperation({
    summary: 'Use this endpoint to create a new family',
  })
  @Post('create/:userId')
  createFamily(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateFamilyDto,
  ) {
    return this.familyService.createFamily(dto, userId);
  }

  @ApiOperation({
    summary: 'Use this endpoint to join a new family',
  })
  @Post('join/:userId')
  joinFamily(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: JoinFamilyDto,
  ) {
    return this.familyService.joinFamily(dto, userId);
  }
}
