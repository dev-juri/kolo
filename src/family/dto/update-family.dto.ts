import { PartialType } from '@nestjs/mapped-types';
import { CreateFamilyDto } from './create-family.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateFamilyDto extends PartialType(CreateFamilyDto) {}

export class JoinFamilyDto {
    @IsString()
    @IsNotEmpty()
    familyCode: string;
}
