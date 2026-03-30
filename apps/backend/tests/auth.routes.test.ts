import crypto from 'crypto';
import express from 'express';
import request from 'supertest';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import authRouter from '../src/routes/api/auth';
import { errorHandlingMiddleware, notFoundMiddleware } from '../src/middlewares/errorHandlingMiddleware';

vi.mock('../src/services/authService', () => ({
  claimAccess: vi.fn(),
  initiatePayment: vi.fn(),
  finalizePayment: vi.fn()
}));

vi.mock('../src/utils/paymentVerifier', () => ({
  verifyVNPaySignature: vi.fn(),
  verifyMoMoSignature: vi.fn()
}));

import { claimAccess, finalizePayment, initiatePayment } from '../src/services/authService';
import { verifyVNPaySignature, verifyMoMoSignature } from '../src/utils/paymentVerifier';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', authRouter);
  app.use(notFoundMiddleware);
  app.use(errorHandlingMiddleware);
  return app;
}

describe('AUTH routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PAYMENT_CALLBACK_SECRET = 'unit-test-secret';
    process.env.PAYMENT_CALLBACK_MAX_AGE_SECONDS = '300';
  });

  it('POST /api/v1/auth/claim should return 400 when code is missing', async () => {
    const app = createApp();

    const res = await request(app).post('/api/v1/auth/claim').send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Thiếu code hoặc claimCode');
  });

  it('POST /api/v1/auth/claim should return auth payload when success', async () => {
    const app = createApp();
    vi.mocked(claimAccess).mockResolvedValue({
      token: 'token-1',
      accessToken: 'token-1',
      tokenType: 'Bearer',
      expiresIn: 86400,
      method: 'claim_code',
      deviceId: 'd1'
    });

    const res = await request(app).post('/api/v1/auth/claim').send({ code: 'ABC123', deviceId: 'd1' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBe('token-1');
    expect(claimAccess).toHaveBeenCalledWith('ABC123', 'd1');
  });

  it('POST /api/v1/auth/payment/initiate should return 400 on invalid provider', async () => {
    const app = createApp();

    const res = await request(app).post('/api/v1/auth/payment/initiate').send({ paymentMethod: 'bad', amount: 1 });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('provider phải là vnpay hoặc momo');
  });

  it('POST /api/v1/auth/payment/initiate should return payment payload when success', async () => {
    const app = createApp();
    vi.mocked(initiatePayment).mockResolvedValue({
      orderId: 'order-1',
      transactionId: 'order-1',
      provider: 'VNPAY',
      amount: 50000,
      currency: 'VND',
      status: 'PENDING',
      paymentUrl: 'https://pay.local',
      expiresAt: new Date().toISOString(),
      expiresIn: 900
    });

    const res = await request(app)
      .post('/api/v1/auth/payment/initiate')
      .send({ paymentMethod: 'vnpay', amount: 50000, deviceId: 'dev1' });

    expect(res.status).toBe(200);
    expect(res.body.orderId).toBe('order-1');
    expect(initiatePayment).toHaveBeenCalled();
  });

  it('POST /api/v1/auth/payment/callback should validate signature and return token', async () => {
    const app = createApp();
    const orderId = 'txn_test_1';
    const timestamp = String(Date.now());
    const payload = [orderId, 'success', 'dev1', timestamp].join('|');
    const signature = crypto.createHmac('sha256', 'unit-test-secret').update(payload).digest('hex');

    vi.mocked(finalizePayment).mockResolvedValue({
      orderId,
      status: 'SUCCEEDED',
      idempotent: false,
      token: 'jwt-1',
      expiresIn: 86400,
      deviceId: 'dev1'
    });

    const res = await request(app)
      .post('/api/v1/auth/payment/callback')
      .set('x-idempotency-key', 'idem-1')
      .set('x-callback-timestamp', timestamp)
      .set('x-callback-signature', signature)
      .send({ orderId, status: 'success', deviceId: 'dev1' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBe('jwt-1');
    expect(finalizePayment).toHaveBeenCalled();
  });

  it('POST /api/v1/auth/payment/callback should validate VNPay signature and return token', async () => {
    const app = createApp();
    const orderId = 'txn_vnpay_1';
    
    vi.mocked(verifyVNPaySignature).mockReturnValue(true);
    vi.mocked(finalizePayment).mockResolvedValue({
      orderId,
      status: 'SUCCEEDED',
      idempotent: false,
      token: 'jwt-vnpay',
      expiresIn: 86400,
      deviceId: 'dev2'
    });

    const res = await request(app)
      .post('/api/v1/auth/payment/callback')
      .set('x-idempotency-key', 'idem-vnpay')
      .send({ 
        orderId, 
        status: 'success', 
        deviceId: 'dev2',
        provider: 'vnpay',
        gatewayPayload: { vnp_SecureHash: 'test-hash' }
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBe('jwt-vnpay');
    expect(verifyVNPaySignature).toHaveBeenCalled();
    expect(finalizePayment).toHaveBeenCalledWith(expect.objectContaining({
      signatureHash: 'test-hash'
    }));
  });

  it('POST /api/v1/auth/payment/callback should return 401 on invalid VNPay signature', async () => {
    const app = createApp();
    
    vi.mocked(verifyVNPaySignature).mockReturnValue(false);

    const res = await request(app)
      .post('/api/v1/auth/payment/callback')
      .set('x-idempotency-key', 'idem-vnpay2')
      .send({ 
        orderId: 'txn_vnpay_2', 
        status: 'success', 
        provider: 'vnpay',
        gatewayPayload: { vnp_SecureHash: 'bad-hash' }
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Chữ ký callback (gateway hoặc internal) không hợp lệ');
  });
});
