import { PartialType } from '@nestjs/mapped-types';
import { CreateFamilyDto } from './create-family.dto';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFamilyDto extends PartialType(CreateFamilyDto) {}

export class JoinFamilyDto {
    @ApiProperty({
        example: "pEQM8",
        description: "Enter a valid family code."
      })
    @IsString()
    @IsNotEmpty()
    familyCode: string;
}
