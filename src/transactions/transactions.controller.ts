import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { TransactionsService } from './providers/transactions.service';
import { DepositDto } from './dtos/deposit.dto';
import { PAYSTACK_WEBHOOK_SIGNATURE_KEY } from 'src/constants';
import { PaystackWebhookDto } from './dtos/paystack-res.dto';
import { Transaction } from './entities/transactions.entity';
import { WithdrawDto } from './dtos/withdraw.dto';
import { Request, Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Tranasactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({
    summary: "Use this endpoint to deposit money into family's account",
  })
  @Post('deposit')
  public deposit(@Body() depositDto: DepositDto) {
    return this.transactionsService.initTransaction(depositDto);
  }

  @ApiOperation({
    summary:
      "Use this endpoint to withdraw money from a family's account",
  })
  @Post('withdraw')
  public withdraw(@Body() withdrawDto: WithdrawDto) {
    return this.transactionsService.withdraw(withdrawDto);
  }

  @ApiOperation({
    summary:
      "Use this endpoint to fetch a list of transactions on a family's account",
  })
  @Get('/:familyId')
  public fetchUserTransactions(
    @Param('familyId', ParseIntPipe) familyId: number,
  ) {
    return this.transactionsService.findTransactionsForFamily(familyId);
  }

  @ApiOperation({
    summary: 'Use this endpoint to verify the status of a transaction',
  })
  @Get('/verify')
  async verifyTransaction(
    @Query('reference') reference: string,
  ): Promise<Transaction> {
    return await this.transactionsService.verifyTransaction(reference);
  }

  @Get('/callback')
  async callbackHandler(
    @Query('trxref') trxref: string,
    @Query('reference') reference: string,
  ) {
    this.transactionsService.verifyTransaction(trxref);
  }

  @Get('/cancel')
  async cancelHandler() {}

  @Post('/webhook')
  @HttpCode(HttpStatus.OK)
  async paymentWebhookHandler(@Req() req: Request, @Res() res: Response) {
    let dto: PaystackWebhookDto = req.body;

    const result = await this.transactionsService.handlePaystackWebhook(
      dto,
      `${req.headers[PAYSTACK_WEBHOOK_SIGNATURE_KEY]}`,
    );

    if (!result) {
      throw new BadRequestException();
    }

    return res.status(200).send('Payment processed');
  }
}
