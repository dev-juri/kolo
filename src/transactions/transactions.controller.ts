import { Body, Controller, Post } from '@nestjs/common';
import { TransactionsService } from './providers/transactions.service';
import { DepositDto } from './dtos/deposit.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('deposit')
  public deposit(@Body() depositDto: DepositDto) {
    return this.transactionsService.initTransaction(depositDto);
  }
}
