import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../entities/transactions.entity';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import {
  PAYSTACK_INIT_TRANSACTION,
  PAYSTACK_SUCCESS_STATUS,
  PAYSTACK_TRANSACTION_VERIFY_BASE_URL,
  PAYSTACK_WEBHOOK_CRYPTO_ALGO,
} from 'src/constants';
import { DepositDto } from '../dtos/deposit.dto';
import { UsersService } from 'src/users/providers/users.service';
import { transactionType } from '../enums/transactionType.enum';
import { TransactionDto } from '../dtos/transaction.dto';
import {
  PaystackCreateTransactionDto,
  PaystackCreateTransactionResponseDto,
  PaystackVerifyTransactionResponseDto,
  PaystackWebhookDto,
} from '../dtos/paystack-res.dto';
import { createHmac, timingSafeEqual } from 'crypto';
import { transactionStatus } from '../enums/transactionStatus.enum';
import { WithdrawDto } from '../dtos/withdraw.dto';
import { use } from 'passport';
import { User } from 'src/users/entities/user.entity';

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

    private readonly dataSource: DataSource,
  ) {}

  async withdraw(withdrawDto: WithdrawDto) {
    //Fetch user
    let user = await this.usersService.findUser(withdrawDto.userId);
    if (!user) throw new NotFoundException('User not found');

    // Convert withdrawal amount to kobo
    withdrawDto.amount = withdrawDto.amount * 100;
    if (Number(user.balance) < withdrawDto.amount) {
      throw new BadRequestException('Insufficient funds.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    // Deduct user balance
    user.balance = Number(user.balance) - withdrawDto.amount;

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
    } catch (error) {
      throw new InternalServerErrorException(
        'Could not connect to the database.',
      );
    }

    try {
      // Save user
      await queryRunner.manager.save(User, user);

      let transactionDto: TransactionDto = {
        type: transactionType.WITHDRAWAL,
        amount: withdrawDto.amount,
        transaction_ref: this.generateString(10),
        access_code: this.generateString(15),
        user: user,
        accountName: withdrawDto.accountName,
        accountNumber: withdrawDto.accountNumber,
        remarks: withdrawDto.remarks,
      };
      let newTxn = queryRunner.manager.create(Transaction, transactionDto);
      newTxn.status = transactionStatus.SUCCESSFUL;
      await queryRunner.manager.save(newTxn);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new ConflictException('Could not complete the transaction', {
        description: String(error),
      });
    } finally {
      try {
        await queryRunner.release();
      } catch (error) {
        throw new InternalServerErrorException(
          'Could not release the connection',
          {
            description: String(error),
          },
        );
      }
    }

    delete user.password;

    return {
      statusCode: HttpStatus.OK,
      message: 'Withdrawal successful',
      data: { user },
    };
  }

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
    } catch (error) {}

    if (!result)
      throw new InternalServerErrorException(
        'Unable to checkout to payment gateway',
      );

    let txn: TransactionDto = {
      amount: depositDto.amount * 100,
      access_code: result.data.access_code,
      transaction_ref: result.data.reference,
      type: transactionType.DEPOSIT,
      user: user,
    };

    // Check if duplicate txn exists
    let txnExists = undefined;
    try {
      txnExists = await this.txnRepository.findOne({
        where: [
          { transaction_ref: txn.transaction_ref },
          { access_code: txn.access_code },
        ],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Unable to connect to the database',
      );
    }

    if (txnExists)
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: 'Duplicate transaction detected',
        data: {
          referecence: txnExists.transaction_ref,
        },
      });

    // Save transaction
    const newTxn = this.txnRepository.create(txn);

    try {
      await this.txnRepository.save(newTxn);
    } catch (error) {
      throw new InternalServerErrorException(
        'Unable to connect to the database',
      );
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Checkout URL created',
      data: {
        authorization_url: result.data.authorization_url,
      },
    };
  }

  async verifyTransaction(ref: string): Promise<Transaction | null> {
    // Find transaction with given reference
    const transaction = await this.txnRepository.findOne({
      where: {
        transaction_ref: ref,
      },
    });

    if (!transaction) {
      return null;
    }

    // If transaction has already been processed
    if (
      transaction.status == transactionStatus.SUCCESSFUL ||
      transaction.status == transactionStatus.FAILED
    ) {
      return transaction;
    }

    let response: AxiosResponse<PaystackVerifyTransactionResponseDto>;

    try {
      const url = `${PAYSTACK_TRANSACTION_VERIFY_BASE_URL}/${ref}`;
      response = await axios.get<PaystackVerifyTransactionResponseDto>(url, {
        headers: {
          Authorization: `Bearer ${this.configService.get<string>(
            'paystackConfig.secretKey',
          )}`,
        },
      });
    } catch (error) {}

    if (!response) {
      return null;
    }

    const result = response.data;

    const txnStatus = result?.data?.status;
    const paymentConfirmed = txnStatus === PAYSTACK_SUCCESS_STATUS;

    if (paymentConfirmed) {
      transaction.status = transactionStatus.SUCCESSFUL;

      transaction.user = await this.usersService.updateUserBalance(
        transaction.amount,
        transaction.user.id,
      );
    } else {
      transaction.status = transactionStatus.FAILED;
    }

    delete transaction.user.password;

    return await this.txnRepository.save(transaction);
  }

  async handlePaystackWebhook(
    dto: PaystackWebhookDto,
    signature: string,
  ): Promise<boolean> {
    if (!dto.data) {
      return false;
    }

    let isValidEvent = false;

    try {
      const hash = createHmac(
        PAYSTACK_WEBHOOK_CRYPTO_ALGO,
        this.configService.get<string>('paystack.secretKey'),
      )
        .update(JSON.stringify(dto))
        .digest('hex');

      isValidEvent =
        hash &&
        signature &&
        timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
    } catch (error) {}

    if (!isValidEvent) {
      return false;
    }

    const transaction = await this.txnRepository.findOne({
      where: {
        transaction_ref: dto.data.reference,
      },
    });

    const txnStatus = dto.data.status;
    const paymentConfirmed = txnStatus === PAYSTACK_SUCCESS_STATUS;

    if (paymentConfirmed) {
      transaction.status = transactionStatus.SUCCESSFUL;
      transaction.user = await this.usersService.updateUserBalance(
        transaction.amount,
        transaction.user.id,
      );
    } else {
      transaction.status = transactionStatus.FAILED;
    }

    await this.txnRepository.save(transaction);

    return true;
  }

  generateString(length: number): string {
    const chars =
      'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890';
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars[randomIndex];
    }

    return result;
  }
}
