import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import crypto from 'crypto';
import prisma from '../src/lib/prisma';
import { finalizePayment } from '../src/services/authService';

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDatabaseUrl ? describe : describe.skip;

describeIfDb('Payment Finalize Integration Tests', () => {
  const transactionId = `txn_integ_${Date.now()}`;
  const idempotencyKey = `idem_${Date.now()}`;
  
  beforeAll(async () => {
    await prisma.$connect();
    
    // Tạo 1 transaction PENDING
    await prisma.paymentTransaction.create({
      data: {
        transactionId,
        provider: 'VNPAY',
        amount: 50000,
        currency: 'VND',
        status: 'PENDING',
        paymentUrl: 'http://test-url',
        returnUrl: 'http://return-url',
        expiresAt: new Date(Date.now() + 1000000)
      }
    });
  });

  afterAll(async () => {
    // Dọn dẹp test data sau khi chạy xong
    await prisma.paymentCallbackEvent.deleteMany({
      where: { transactionId }
    });
    await prisma.paymentTransaction.delete({
      where: { transactionId }
    });
    await prisma.$disconnect();
  });

  it('1. finalizePayment with status success MUST update DB to SUCCEEDED', async () => {
    const result = await finalizePayment({
      transactionId,
      status: 'success',
      idempotencyKey,
      signatureHash: 'test-signature-1',
      deviceId: 'dev1'
    });

    expect(result.status).toBe('SUCCEEDED');
    expect(result.idempotent).toBe(false);
    expect(result.token).toBeDefined();

    const dbTx = await prisma.paymentTransaction.findUnique({
      where: { transactionId }
    });
    expect(dbTx?.status).toBe('SUCCEEDED');

    const dbCallback = await prisma.paymentCallbackEvent.findUnique({
      where: { idempotencyKey }
    });
    expect(dbCallback).toBeDefined();
    expect(dbCallback?.status).toBe('SUCCEEDED');
  });

  it('2. finalizePayment with same idempotencyKey MUST return idempotent: true without error', async () => {
    const result = await finalizePayment({
      transactionId,
      status: 'success', // Thậm chí status khác nhưng cùng idempotencyKey cũng sẽ bị bỏ qua và trả về kết quả cũ
      idempotencyKey,
      signatureHash: 'test-signature-1',
      deviceId: 'dev2'
    });

    expect(result.status).toBe('SUCCEEDED');
    expect(result.idempotent).toBe(true);
    expect(result.token).toBeDefined(); 
  });

  it('3. finalizePayment with DIFFERENT idempotencyKey for SAME transaction MUST throw PAYMENT_ALREADY_FINALIZED', async () => {
    await expect(
      finalizePayment({
        transactionId,
        status: 'failed',
        idempotencyKey: `idem_another_${Date.now()}`,
        signatureHash: 'test-signature-another',
        deviceId: 'dev3'
      })
    ).rejects.toThrow('PAYMENT_ALREADY_FINALIZED');
  });
});
