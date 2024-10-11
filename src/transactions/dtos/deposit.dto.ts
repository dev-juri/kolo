import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class DepositDto {

  @ApiProperty({
    example: "1",
    description: "A valid userId"
  })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    example: "1",
    description: "A valid familyId"
  })
  @IsInt()
  @IsNotEmpty()
  familyId: number;

  @ApiProperty({
    example: "2000.50",
    description: "A valid amount, should have at most 2 decimal places"
  })
  @IsNumber({
    maxDecimalPlaces: 2
  }, {
    message: "Amount must contain maximum of 2 decimal places"
  })
  @IsNotEmpty()
  @Type(()=> Number)
  amount: number;
}
