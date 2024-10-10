import { User } from 'src/users/entities/user.entity';
import { transactionType } from '../enums/transactionType.enum';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Family } from 'src/family/entities/family.entity';

export class TransactionDto {
  @IsEnum({
    type: transactionType,
  })
  @IsNotEmpty()
  type: transactionType;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  transaction_ref: string;

  @IsString()
  @IsNotEmpty()
  access_code: string;

  @IsString()
  @IsOptional()
  accountName?: string;

  @IsString()
  @IsOptional()
  accountNumber?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  user: User;

  family: Family
}
