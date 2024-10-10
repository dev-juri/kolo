export const PAYSTACK_INIT_TRANSACTION =
  'https://api.paystack.co/transaction/initialize';

export const PAYSTACK_TRANSACTION_VERIFY_BASE_URL =
  'https://api.paystack.co/transaction/verify';

export const PAYSTACK_WEBHOOK_CRYPTO_ALGO = 'sha512';
export const PAYSTACK_WEBHOOK_SIGNATURE_KEY = 'x-paystack-signature';
export const PAYSTACK_SUCCESS_STATUS = 'success';

// Generate mock reference and access codes, for the withdrawal process
export const generateString = (length: number) => {
  const chars =
    'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }

  return result;
};
