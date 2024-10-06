import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { TransactionsService } from './providers/transactions.service';
import { DepositDto } from './dtos/deposit.dto';
import { PAYSTACK_WEBHOOK_SIGNATURE_KEY } from 'src/constants';
import {
  PaystackCallbackDto,
  PaystackWebhookDto,
} from './dtos/paystack-res.dto';
import { Transaction } from './entities/transactions.entity';
import { WithdrawDto } from './dtos/withdraw.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('deposit')
  public deposit(@Body() depositDto: DepositDto) {
    return this.transactionsService.initTransaction(depositDto);
  }

  @Post('withdraw')
  public withdraw(@Body() withdrawDto: WithdrawDto) {
    return this.transactionsService.withdraw(withdrawDto);
  }

  @Get('/:userId')
  public fetchUserTransactions(@Param('userId', ParseIntPipe) userId: number) {
    return this.transactionsService.findTransactionsForUser(userId)
  }

  @Get('/callback')
  async verifyTransaction(
    @Query('reference') reference: string,
  ): Promise<Transaction> {
    return await this.transactionsService.verifyTransaction(reference);
  }

  @Post('/webhook')
  @HttpCode(HttpStatus.OK)
  async paymentWebhookHandler(
    @Body() dto: PaystackWebhookDto,
    @Headers() headers = {},
  ) {
    const result = await this.transactionsService.handlePaystackWebhook(
      dto,
      `${headers[PAYSTACK_WEBHOOK_SIGNATURE_KEY]}`,
    );

    if (!result) {
      throw new BadRequestException();
    }
  }
}
