import express from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import ApiError from '../src/utils/ApiError';
import { errorHandlingMiddleware, notFoundMiddleware } from '../src/middlewares/errorHandlingMiddleware';

function createAppForErrors() {
  const app = express();

  app.get('/known-error', (req, res, next) => {
    next(new Error('PAYMENT_NOT_FOUND'));
  });

  app.get('/api-error', (req, res, next) => {
    next(new ApiError(403, 'Không có quyền truy cập'));
  });

  app.use(notFoundMiddleware);
  app.use(errorHandlingMiddleware);
  return app;
}

describe('Error handling middleware', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('maps known service error codes to expected status', async () => {
    const app = createAppForErrors();

    const res = await request(app).get('/known-error');

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Không tìm thấy giao dịch thanh toán');
  });

  it('returns ApiError status and message', async () => {
    const app = createAppForErrors();

    const res = await request(app).get('/api-error');

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Không có quyền truy cập');
  });

  it('hides stack trace in production mode', async () => {
    process.env.NODE_ENV = 'production';
    const app = createAppForErrors();

    const res = await request(app).get('/api-error');

    expect(res.status).toBe(403);
    expect(res.body.stack).toBeUndefined();
  });

  it('returns not-found error for unknown route', async () => {
    const app = createAppForErrors();

    const res = await request(app).get('/no-such-route');

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Không tìm thấy endpoint');
  });
});
