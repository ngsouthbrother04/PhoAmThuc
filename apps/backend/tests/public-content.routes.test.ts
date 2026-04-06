import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import poisRouter from '../src/routes/api/pois';
import toursRouter from '../src/routes/api/tours';
import { errorHandlingMiddleware, notFoundMiddleware } from '../src/middlewares/errorHandlingMiddleware';
import { getPublicPois, getPublicPoiById, searchPoisByRadius } from '../src/services/poiPublicService';
import { getPublicTours, getPublicTourById } from '../src/services/tourPublicService';
import { isAccessTokenSessionActive, verifyJwt, isUserPremium } from '../src/services/authService';

vi.mock('../src/services/poiPublicService', () => ({
  getPublicPois: vi.fn(),
  getPublicPoiById: vi.fn(),
  searchPoisByRadius: vi.fn()
}));

vi.mock('../src/services/tourPublicService', () => ({
  getPublicTours: vi.fn(),
  getPublicTourById: vi.fn()
}));

vi.mock('../src/services/authService', () => ({
  verifyJwt: vi.fn(),
  isAccessTokenSessionActive: vi.fn(),
  isUserPremium: vi.fn()
}));

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/pois', poisRouter);
  app.use('/api/v1/tours', toursRouter);
  app.use(notFoundMiddleware);
  app.use(errorHandlingMiddleware);
  return app;
}

describe('Public Content API (Pois, Tours)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyJwt).mockReturnValue({ sub: 'user-id' });
    vi.mocked(isAccessTokenSessionActive).mockResolvedValue(true);
    vi.mocked(isUserPremium).mockResolvedValue(false);
  });

  describe('POIs', () => {
    it('GET /api/v1/pois should return pois with pagination (TC-18.6)', async () => {
      const app = createApp();
      vi.mocked(getPublicPois).mockResolvedValue({
        items: [{ id: 'poi-1', name: 'A', description: 'B', audioUrls: {}, latitude: 1, longitude: 2, type: 'FOOD', image: null }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
      });

      const res = await request(app)
        .get('/api/v1/pois')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
    });

    it('POST /api/v1/pois/search/radius should return nearest pois', async () => {
      const app = createApp();
      vi.mocked(searchPoisByRadius).mockResolvedValue({
        items: [{ id: 'poi-1' }],
        meta: { radiusM: 500, center: { latitude: 21, longitude: 105 } }
      });

      const res = await request(app)
        .post('/api/v1/pois/search/radius')
        .send({ latitude: 21, longitude: 105, radiusM: 500 })
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
      expect(res.body.items).toBeDefined();
      expect(res.body.meta.radiusM).toBe(500);
    });
  });

  describe('Tours', () => {
    it('GET /api/v1/tours/:id should return tour contract (TC-18.7)', async () => {
      const app = createApp();
      vi.mocked(getPublicTourById).mockResolvedValue({
        id: 'tour-1',
        name: 'Tour',
        description: 'Desc',
        duration: 90,
        poiIds: ['poi-1', 'poi-2'],
        image: null
      });

      const res = await request(app)
        .get('/api/v1/tours/tour-1')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('tour-1');
      expect(res.body.data.poiIds).toEqual(['poi-1', 'poi-2']);
    });
  });
});
