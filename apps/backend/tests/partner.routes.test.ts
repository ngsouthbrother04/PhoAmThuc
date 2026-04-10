import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import partnerRouter from '../src/routes/api/partner';
import { errorHandlingMiddleware, notFoundMiddleware } from '../src/middlewares/errorHandlingMiddleware';
import ApiError from '../src/utils/ApiError';

vi.mock('../src/services/imageService', () => ({
  uploadPoiImage: vi.fn(),
  uploadTourImage: vi.fn()
}));

vi.mock('../src/services/poiAdminService', () => ({
  createAdminPoi: vi.fn(),
  createAdminTour: vi.fn(),
  deleteAdminPoi: vi.fn(),
  deleteAdminTour: vi.fn(),
  getAdminPoiById: vi.fn(),
  getAdminTourById: vi.fn(),
  updateAdminPoi: vi.fn(),
  updateAdminTour: vi.fn()
}));

vi.mock('../src/services/authService', () => ({
  verifyJwt: vi.fn(),
  isAccessTokenSessionActive: vi.fn(),
  getCurrentUserRole: vi.fn()
}));

import { uploadPoiImage, uploadTourImage } from '../src/services/imageService';
import {
  createAdminPoi,
  createAdminTour,
  deleteAdminPoi,
  deleteAdminTour,
  getAdminPoiById,
  getAdminTourById,
  updateAdminPoi,
  updateAdminTour
} from '../src/services/poiAdminService';
import { getCurrentUserRole, isAccessTokenSessionActive, verifyJwt } from '../src/services/authService';

const PARTNER_AUTH_HEADER = 'Bearer partner-token';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/partner', partnerRouter);
  app.use(notFoundMiddleware);
  app.use(errorHandlingMiddleware);
  return app;
}

describe('PARTNER routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyJwt).mockReturnValue({ sub: 'partner-1', role: 'PARTNER' });
    vi.mocked(isAccessTokenSessionActive).mockResolvedValue(true);
    vi.mocked(getCurrentUserRole).mockResolvedValue('PARTNER');
    vi.mocked(getAdminPoiById).mockResolvedValue({ id: 'poi-1' } as never);
    vi.mocked(getAdminTourById).mockResolvedValue({ id: 'tour-1' } as never);
  });

  it('POST /api/v1/partner/pois should create POI directly', async () => {
    const app = createApp();
    vi.mocked(createAdminPoi).mockResolvedValue({
      id: 'poi-1',
      name: { vi: 'Phở Thìn' }
    } as never);

    const res = await request(app)
      .post('/api/v1/partner/pois')
      .set('Authorization', PARTNER_AUTH_HEADER)
      .send({
        name: { vi: 'Phở Thìn' },
        description: { vi: 'Nổi tiếng' },
        latitude: 21.01,
        longitude: 105.85,
        type: 'FOOD',
        radius: 50
      });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe('poi-1');
    expect(createAdminPoi).toHaveBeenCalledWith(
      expect.objectContaining({
        creatorId: 'partner-1'
      }),
      expect.objectContaining({
        actor: 'partner-1'
      })
    );
  });

  it('PUT /api/v1/partner/pois/:id should update POI directly', async () => {
    const app = createApp();
    vi.mocked(updateAdminPoi).mockResolvedValue({ id: 'poi-1' } as never);

    const res = await request(app)
      .put('/api/v1/partner/pois/poi-1')
      .set('Authorization', PARTNER_AUTH_HEADER)
      .send({ name: { vi: 'Phở Thìn mới' } });

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('poi-1');
    expect(updateAdminPoi).toHaveBeenCalledWith(
      'poi-1',
      expect.objectContaining({ name: { vi: 'Phở Thìn mới' } }),
      { actorId: 'partner-1', role: 'PARTNER' },
      expect.objectContaining({ actor: 'partner-1' })
    );
  });

  it('DELETE /api/v1/partner/pois/:id should delete POI directly', async () => {
    const app = createApp();
    vi.mocked(deleteAdminPoi).mockResolvedValue({ id: 'poi-1' } as never);

    const res = await request(app)
      .delete('/api/v1/partner/pois/poi-1')
      .set('Authorization', PARTNER_AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('poi-1');
    expect(deleteAdminPoi).toHaveBeenCalledWith(
      'poi-1',
      { actorId: 'partner-1', role: 'PARTNER' },
      expect.objectContaining({ actor: 'partner-1' })
    );
  });

  it('POST /api/v1/partner/tours should create Tour directly', async () => {
    const app = createApp();
    vi.mocked(createAdminTour).mockResolvedValue({ id: 'tour-1' } as never);

    const res = await request(app)
      .post('/api/v1/partner/tours')
      .set('Authorization', PARTNER_AUTH_HEADER)
      .send({
        name: { vi: 'Tour phố cổ' },
        description: { vi: 'Mô tả' },
        poiIds: ['poi-1']
      });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe('tour-1');
    expect(createAdminTour).toHaveBeenCalledWith(
      expect.objectContaining({ creatorId: 'partner-1' }),
      expect.objectContaining({ actor: 'partner-1' })
    );
  });

  it('PUT /api/v1/partner/tours/:id should update Tour directly', async () => {
    const app = createApp();
    vi.mocked(updateAdminTour).mockResolvedValue({ id: 'tour-1' } as never);

    const res = await request(app)
      .put('/api/v1/partner/tours/tour-1')
      .set('Authorization', PARTNER_AUTH_HEADER)
      .send({ name: { vi: 'Tour mới' } });

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('tour-1');
    expect(updateAdminTour).toHaveBeenCalledWith(
      'tour-1',
      expect.objectContaining({ name: { vi: 'Tour mới' } }),
      { actorId: 'partner-1', role: 'PARTNER' },
      expect.objectContaining({ actor: 'partner-1' })
    );
  });

  it('DELETE /api/v1/partner/tours/:id should delete Tour directly', async () => {
    const app = createApp();
    vi.mocked(deleteAdminTour).mockResolvedValue({ id: 'tour-1' } as never);

    const res = await request(app)
      .delete('/api/v1/partner/tours/tour-1')
      .set('Authorization', PARTNER_AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('tour-1');
    expect(deleteAdminTour).toHaveBeenCalledWith(
      'tour-1',
      { actorId: 'partner-1', role: 'PARTNER' },
      expect.objectContaining({ actor: 'partner-1' })
    );
  });

  it('POST /api/v1/partner/pois/:id/image/upload should upload POI image', async () => {
    const app = createApp();
    vi.mocked(uploadPoiImage).mockResolvedValue({
      poiId: 'poi-1',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/phoamthuc/pois/poi-1.jpg',
      contentVersion: 3
    });

    const res = await request(app)
      .post('/api/v1/partner/pois/poi-1/image/upload')
      .set('Authorization', PARTNER_AUTH_HEADER)
      .attach('image', Buffer.from('fake-image-binary'), {
        filename: 'poi-1.jpg',
        contentType: 'image/jpeg'
      });

    expect(res.status).toBe(200);
    expect(res.body.poiId).toBe('poi-1');
    expect(uploadPoiImage).toHaveBeenCalledWith('poi-1', expect.any(Object));
    expect(getAdminPoiById).toHaveBeenCalledWith('poi-1', { actorId: 'partner-1', role: 'PARTNER' });
  });

  it('POST /api/v1/partner/tours/:id/image/upload should upload tour image', async () => {
    const app = createApp();
    vi.mocked(uploadTourImage).mockResolvedValue({
      tourId: 'tour-1',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/phoamthuc/tours/tour-1.jpg',
      contentVersion: 4
    });

    const res = await request(app)
      .post('/api/v1/partner/tours/tour-1/image/upload')
      .set('Authorization', PARTNER_AUTH_HEADER)
      .attach('image', Buffer.from('fake-image-binary'), {
        filename: 'tour-1.jpg',
        contentType: 'image/jpeg'
      });

    expect(res.status).toBe(200);
    expect(res.body.tourId).toBe('tour-1');
    expect(uploadTourImage).toHaveBeenCalledWith('tour-1', expect.any(Object));
    expect(getAdminTourById).toHaveBeenCalledWith('tour-1', { actorId: 'partner-1', role: 'PARTNER' });
  });

  it('POST /api/v1/partner/pois/:id/image/upload should reject when PARTNER does not own the POI', async () => {
    const app = createApp();
    vi.mocked(getAdminPoiById).mockRejectedValue(new ApiError(403, 'Không có quyền truy cập POI này.'));

    const res = await request(app)
      .post('/api/v1/partner/pois/poi-foreign/image/upload')
      .set('Authorization', PARTNER_AUTH_HEADER)
      .attach('image', Buffer.from('fake-image-binary'), {
        filename: 'poi-foreign.jpg',
        contentType: 'image/jpeg'
      });

    expect(res.status).toBe(403);
    expect(uploadPoiImage).not.toHaveBeenCalled();
    expect(getAdminPoiById).toHaveBeenCalledWith('poi-foreign', { actorId: 'partner-1', role: 'PARTNER' });
  });

  it('POST /api/v1/partner/tours/:id/image/upload should reject when PARTNER does not own the Tour', async () => {
    const app = createApp();
    vi.mocked(getAdminTourById).mockRejectedValue(new ApiError(403, 'Không có quyền truy cập Tour này.'));

    const res = await request(app)
      .post('/api/v1/partner/tours/tour-foreign/image/upload')
      .set('Authorization', PARTNER_AUTH_HEADER)
      .attach('image', Buffer.from('fake-image-binary'), {
        filename: 'tour-foreign.jpg',
        contentType: 'image/jpeg'
      });

    expect(res.status).toBe(403);
    expect(uploadTourImage).not.toHaveBeenCalled();
    expect(getAdminTourById).toHaveBeenCalledWith('tour-foreign', { actorId: 'partner-1', role: 'PARTNER' });
  });

  it('GET /api/v1/partner/approval-requests/mine should return 404 (deprecated endpoint)', async () => {
    const app = createApp();

    const res = await request(app)
      .get('/api/v1/partner/approval-requests/mine?status=PENDING')
      .set('Authorization', PARTNER_AUTH_HEADER);

    expect(res.status).toBe(404);
  });

  it('GET /api/v1/partner/approval-requests/mine/:id should return 404 (deprecated endpoint)', async () => {
    const app = createApp();

    const res = await request(app)
      .get('/api/v1/partner/approval-requests/mine/req-other')
      .set('Authorization', PARTNER_AUTH_HEADER);

    expect(res.status).toBe(404);
  });
});
