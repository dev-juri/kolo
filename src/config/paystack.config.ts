import { registerAs } from '@nestjs/config';

export default registerAs('paystackConfig', () => ({
  callbackUrl: process.env.PAYSTACK_CALLBACK_URL,
  cancelUrl: process.env.PAYSTACK_CANCEL_URL,
  publicKey: process.env.PAYSTACK_PUBLIC_KEY,
  secretKey: process.env.PAYSTACK_SECRET_KEY,
}));
