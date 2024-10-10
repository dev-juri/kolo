import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class WithdrawDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  accountName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10, { message: 'Account number must be 10 digits long' })
  accountNumber: string;

  @IsString()
  @IsNotEmpty()
  bankName: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'Amount must contain maximum of 2 decimal places',
    },
  )
  @IsNotEmpty()
  @Type(() => Number)
  @IsNotEmpty()
  amount: number;

  @IsInt()
  @IsNotEmpty()
  familyId: number;

}
