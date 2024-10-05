import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../entities/transactions.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PAYSTACK_INIT_TRANSACTION } from 'src/constants';
import { DepositDto } from '../dtos/deposit.dto';
import { UsersService } from 'src/users/providers/users.service';
import { transactionType } from '../enums/transactionType.enum';
import { TransactionDto } from '../dtos/transaction.dto';
import {
  PaystackCreateTransactionDto,
  PaystackCreateTransactionResponseDto,
} from '../dtos/paystack-res.dto';

@Injectable()
export class TransactionsService {
  constructor(
    /**
     * Inject ConfigService
     */
    private readonly configService: ConfigService,

    private readonly usersService: UsersService,

    @InjectRepository(Transaction)
    private readonly txnRepository: Repository<Transaction>,
  ) {}

  async initTransaction(depositDto: DepositDto) {
    // Find the user
    let user = await this.usersService.findUser(depositDto.userId);

    if (!user) throw new NotFoundException('User does not exist');

    const paystackCreateTransactionDto: PaystackCreateTransactionDto = {
      email: user.email,
      amount: depositDto.amount * 100,
    };

    const paystackCallbackUrl = this.configService.get(
      'paystackConfig.callbackUrl',
    );
    if (paystackCallbackUrl) {
      paystackCreateTransactionDto.callback_url = paystackCallbackUrl;
    }

    // Initiate transaction
    let payload = JSON.stringify(paystackCreateTransactionDto);

    let result: PaystackCreateTransactionResponseDto;
    try {
      let response = await axios.post(PAYSTACK_INIT_TRANSACTION, payload, {
        headers: {
          Authorization: `Bearer ${this.configService.get<string>(
            'paystackConfig.secretKey',
          )}`,
          'Content-Type': 'application/json',
        },
      });
      result = response.data;
    } catch (error) {
      console.log(error);
    }

    if (!result)
      throw new RequestTimeoutException(
        'Unable to checkout to payment gateway',
      );

    let txn = new TransactionDto();
    txn.amount = depositDto.amount * 100;
    txn.access_code = result.data.access_code;
    txn.transaction_ref = result.data.reference;
    txn.type = transactionType.DEPOSIT;
    txn.user = user;

    let txnExists = undefined;
    try {
      txnExists = await this.txnRepository.findOne({
        where: [
          { transaction_ref: txn.transaction_ref },
          { access_code: txn.access_code },
        ],
      });
    } catch (error) {
      throw new RequestTimeoutException('Unable to connect to the database');
    }

    if (txnExists)
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: 'Duplicate transaction detected',
        data: {
          referecence: txnExists.transaction_ref,
        },
      });

    const newTxn = this.txnRepository.create(txn);

    console.log(newTxn);
    try {
      await this.txnRepository.save(newTxn);
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException('Unable to connect to the database');
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Checkout URL created',
      data: {
        authorization_url: result.data.authorization_url,
      },
    };
  }
}
