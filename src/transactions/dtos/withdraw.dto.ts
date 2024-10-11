import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

  @ApiProperty({
    example: "1",
    description: "A valid userId"
  })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    example: "John Doe",
    description: "Recipient's name"
  })
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @ApiProperty({
    example: "1234567890",
    description: "Recipient's account number, must be 10 digits long"
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10, { message: 'Account number must be 10 digits long' })
  accountNumber: string;

  @ApiProperty({
    example: "GTB",
    description: "Recipient's bank name"
  })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiPropertyOptional({
    example: "Food",
    description: "Transaction remarks"
  })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({
    example: "2000.50",
    description: "A valid amount, should have at most 2 decimal places"
  })
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

  @ApiProperty({
    example: "1",
    description: "A valid familyId"
  })
  @IsInt()
  @IsNotEmpty()
  familyId: number;

}
