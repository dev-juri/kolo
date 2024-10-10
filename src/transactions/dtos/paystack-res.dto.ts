import { IsNotEmpty, IsString } from 'class-validator';

export type PaystackCreateTransactionDto = {
  amount: number;
  email: string;
  callback_url?: string;
  metadata?: MetaDataDto
};

export type MetaDataDto = {
  cancel_action : string
}

export type PaystackCreateTransactionResponseDto = {
  status: boolean;
  message: string;
  data: { authorization_url: string; access_code: string; reference: string };
};

export type PaystackVerifyTransactionResponseDto = {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
  };
};

export type PaystackWebhookDto = {
  event: string;
  data: Data;
};

export type Data = {
  id?: number;
  domain?: string;
  status?: string;
  reference?: string;
  amount?: number;
  fees_breakdown?: any;
  gateway_response?: string;
  paid_at?: string;
  created_at?: string;
  channel?: string;
  currency?: string;
  ip_address?: string;
  metadata?: any;
  fees_split?: any;
  message?: any;
  fees: any;
  log?: any;
  customer?: any;
  authorization?: any;
  plan?: any;
  subaccount?: any;
  split?: any;
  order_id?: any;
  paidAt ?: any;
  requested_amount ?: any;
  pos_transaction_data ?: any;
  source ?: any
};

export class PaystackCallbackDto {
  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsString()
  @IsNotEmpty()
  trxref?: string;
}
