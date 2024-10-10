import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class DepositDto {

  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  familyId: number;

  @IsNumber({
    maxDecimalPlaces: 2
  }, {
    message: "Amount must contain maximum of 2 decimal places"
  })
  @IsNotEmpty()
  @Type(()=> Number)
  amount: number;
}
