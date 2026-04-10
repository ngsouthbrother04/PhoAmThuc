import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import adminRouter from '../src/routes/api/admin';
import { errorHandlingMiddleware, notFoundMiddleware } from '../src/middlewares/errorHandlingMiddleware';
import ApiError from '../src/utils/ApiError';

vi.mock('../src/services/ttsService', () => ({
  enqueuePoiTtsGeneration: vi.fn(),
  getTtsQueueStatus: vi.fn(),
  validateTtsRuntimeConfig: vi.fn()
}));

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
  invalidateSyncManifest: vi.fn(),
  listAdminPois: vi.fn(),
  purgeSoftDeletedPois: vi.fn(),
  publishAdminPoi: vi.fn(),
  updateAdminPoi: vi.fn(),
  updateAdminTour: vi.fn()
}));

vi.mock('../src/services/adminUserRoleService', () => ({
  listAdminUsers: vi.fn(),
  assignAdminUserRole: vi.fn(),
  revokeAdminUserRole: vi.fn()
}));

vi.mock('../src/services/authService', () => ({
  verifyJwt: vi.fn(),
  isAccessTokenSessionActive: vi.fn(),
  getCurrentUserRole: vi.fn()
}));

import { enqueuePoiTtsGeneration, getTtsQueueStatus, validateTtsRuntimeConfig } from '../src/services/ttsService';
import { uploadPoiImage, uploadTourImage } from '../src/services/imageService';
import {
  createAdminPoi,
  createAdminTour,
  deleteAdminPoi,
  deleteAdminTour,
  getAdminPoiById,
  getAdminTourById,
  invalidateSyncManifest,
  listAdminPois,
  purgeSoftDeletedPois,
  publishAdminPoi,
  updateAdminPoi,
  updateAdminTour
} from '../src/services/poiAdminService';
import { assignAdminUserRole, listAdminUsers, revokeAdminUserRole } from '../src/services/adminUserRoleService';
import { getCurrentUserRole, isAccessTokenSessionActive, verifyJwt } from '../src/services/authService';

const ADMIN_AUTH_HEADER = 'Bearer admin-token';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/admin', adminRouter);
  app.use(notFoundMiddleware);
  app.use(errorHandlingMiddleware);
  return app;
}

describe('ADMIN routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyJwt).mockReturnValue({ sub: 'admin-1', role: 'ADMIN' });
    vi.mocked(isAccessTokenSessionActive).mockResolvedValue(true);
    vi.mocked(getCurrentUserRole).mockResolvedValue('ADMIN');
  });

  it('POST /api/v1/admin/pois/:id/audio/generate should enqueue tts jobs', async () => {
    const app = createApp();

    vi.mocked(enqueuePoiTtsGeneration).mockResolvedValue({
      poiId: 'poi-1',
      queued: 3,
      skipped: 0,
      jobIds: ['poi-1:vi:1', 'poi-1:en:1', 'poi-1:ja:1'],
      mode: 'in-memory'
    });

    const res = await request(app)
      .post('/api/v1/admin/pois/poi-1/audio/generate')
      .set('Authorization', ADMIN_AUTH_HEADER)
      .send({});

    expect(res.status).toBe(202);
    expect(res.body.poiId).toBe('poi-1');
    expect(res.body.queued).toBe(3);
    expect(enqueuePoiTtsGeneration).toHaveBeenCalledWith('poi-1');
  });

  it('POST /api/v1/admin/pois/:id/audio/generate should return 403 with non-admin role', async () => {
    const app = createApp();
    vi.mocked(verifyJwt).mockReturnValue({ sub: 'user-1', role: 'USER' });

    const res = await request(app)
      .post('/api/v1/admin/pois/poi-1/audio/generate')
      .set('Authorization', ADMIN_AUTH_HEADER)
      .send({});

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Không có quyền');
    expect(enqueuePoiTtsGeneration).not.toHaveBeenCalled();
  });

  it('GET /api/v1/admin/tts/queue/status should return queue stats', async () => {
    const app = createApp();

    vi.mocked(getTtsQueueStatus).mockResolvedValue({
      mode: 'in-memory',
      waiting: 2,
      active: 2,
      completed: 0,
      failed: 0,
      delayed: 0
    });

    const res = await request(app).get('/api/v1/admin/tts/queue/status').set('Authorization', ADMIN_AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.waiting).toBe(2);
    expect(getTtsQueueStatus).toHaveBeenCalledTimes(1);
  });

  it('GET /api/v1/admin/tts/config/validate should return 200 when runtime config is valid', async () => {
    const app = createApp();

    vi.mocked(validateTtsRuntimeConfig).mockReturnValue({
      ok: true,
      queueMode: 'in-memory',
      storageProvider: 'local',
      errors: [],
      warnings: []
    });

    const res = await request(app).get('/api/v1/admin/tts/config/validate').set('Authorization', ADMIN_AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('GET /api/v1/admin/tts/config/validate should return 500 when runtime config is invalid', async () => {
    const app = createApp();

    vi.mocked(validateTtsRuntimeConfig).mockReturnValue({
      ok: false,
      queueMode: 'bullmq',
      storageProvider: 'local',
      errors: ['TTS_STORAGE_PROVIDER must be local.'],
      warnings: []
    });

    const res = await request(app).get('/api/v1/admin/tts/config/validate').set('Authorization', ADMIN_AUTH_HEADER);

    expect(res.status).toBe(500);
    expect(res.body.ok).toBe(false);
    expect(res.body.errors).toHaveLength(1);
  });

  it('POST /api/v1/admin/pois should create POI directly as PARTNER', async () => {
    const app = createApp();

    vi.mocked(verifyJwt).mockReturnValue({ sub: 'partner-1', role: 'PARTNER' });
    vi.mocked(getCurrentUserRole).mockResolvedValue('PARTNER');

    vi.mocked(createAdminPoi).mockResolvedValue({
      id: 'poi-1',
      name: { vi: 'Phở Thìn' }
    } as never);

    const res = await request(app).post('/api/v1/admin/pois').set('Authorization', ADMIN_AUTH_HEADER).send({
      name: { vi: 'Phở Thìn' },
      description: { vi: 'Nổi tiếng' },
      latitude: 21.01,
      longitude: 105.85,
      type: 'FOOD'
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

  it('POST /api/v1/admin/pois should create POI directly as ADMIN', async () => {
    const app = createApp();
    vi.mocked(createAdminPoi).mockResolvedValue({ id: 'poi-2' } as never);

    const res = await request(app).post('/api/v1/admin/pois').set('Authorization', ADMIN_AUTH_HEADER).send({
      name: { vi: 'Phở Thìn' },
      description: { vi: 'Nổi tiếng' },
      latitude: 21.01,
      longitude: 105.85,
      type: 'FOOD'
    });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe('poi-2');
    expect(createAdminPoi).toHaveBeenCalledWith(
      expect.objectContaining({
        creatorId: 'admin-1'
      }),
      expect.objectContaining({
        actor: 'admin-1'
      })
    );
  });

  it('GET /api/v1/admin/pois should list POIs', async () => {
    const app = createApp();

    vi.mocked(listAdminPois).mockResolvedValue([
      {
        id: 'poi-1',
        name: { vi: 'Phở Thìn' },
        description: { vi: 'Nổi tiếng' },
        audioUrls: {},
        latitude: 21.01,
        longitude: 105.85,
        type: 'FOOD',
        image: null,
        isPublished: false,
        publishedAt: null,
        deletedAt: null,
        contentVersion: 1,
        createdAt: new Date('2026-03-25T00:00:00Z').toISOString(),
        updatedAt: new Date('2026-03-25T00:00:00Z').toISOString()
      } as never
    ]);

    const res = await request(app).get('/api/v1/admin/pois').set('Authorization', ADMIN_AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(listAdminPois).toHaveBeenCalledWith({ actorId: 'admin-1', role: 'ADMIN' });
  });

  it('GET /api/v1/admin/pois/:id should return a POI', async () => {
    const app = createApp();

    vi.mocked(getAdminPoiById).mockResolvedValue({
      id: 'poi-1',
      name: { vi: 'Phở Thìn' },
      description: { vi: 'Nổi tiếng' },
      audioUrls: {},
      latitude: 21.01,
      longitude: 105.85,
      type: 'FOOD',
      image: null,
      isPublished: false,
      publishedAt: null,
      deletedAt: null,
      contentVersion: 1,
      createdAt: new Date('2026-03-25T00:00:00Z').toISOString(),
      updatedAt: new Date('2026-03-25T00:00:00Z').toISOString()
    } as never);

    const res = await request(app).get('/api/v1/admin/pois/poi-1').set('Authorization', ADMIN_AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('poi-1');
    expect(getAdminPoiById).toHaveBeenCalledWith('poi-1', { actorId: 'admin-1', role: 'ADMIN' });
  });

  it('PUT /api/v1/admin/pois/:id should update POI directly as PARTNER', async () => {
    const app = createApp();

    vi.mocked(verifyJwt).mockReturnValue({ sub: 'partner-1', role: 'PARTNER' });
    vi.mocked(getCurrentUserRole).mockResolvedValue('PARTNER');
    vi.mocked(updateAdminPoi).mockResolvedValue({ id: 'poi-1' } as never);

    const res = await request(app)
      .put('/api/v1/admin/pois/poi-1')
      .set('Authorization', ADMIN_AUTH_HEADER)
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

  it('DELETE /api/v1/admin/pois/:id should delete POI directly as PARTNER', async () => {
    const app = createApp();

    vi.mocked(verifyJwt).mockReturnValue({ sub: 'partner-1', role: 'PARTNER' });
    vi.mocked(getCurrentUserRole).mockResolvedValue('PARTNER');
    vi.mocked(deleteAdminPoi).mockResolvedValue({ id: 'poi-1' } as never);

    const res = await request(app).delete('/api/v1/admin/pois/poi-1').set('Authorization', ADMIN_AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('poi-1');
    expect(deleteAdminPoi).toHaveBeenCalledWith(
      'poi-1',
      { actorId: 'partner-1', role: 'PARTNER' },
      expect.objectContaining({ actor: 'partner-1' })
    );
  });

  it('POST /api/v1/admin/tours should create Tour directly as PARTNER', async () => {
    const app = createApp();

    vi.mocked(verifyJwt).mockReturnValue({ sub: 'partner-1', role: 'PARTNER' });
    vi.mocked(getCurrentUserRole).mockResolvedValue('PARTNER');
    vi.mocked(createAdminTour).mockResolvedValue({ id: 'tour-1' } as never);

    const res = await request(app)
      .post('/api/v1/admin/tours')
      .set('Authorization', ADMIN_AUTH_HEADER)
      .send({
        name: { vi: 'Tour Pho Co' },
        description: { vi: 'Kham pha pho co' },
        poiIds: ['poi-1', 'poi-2'],
        duration: 90
      });

    expect(res.status).toBe(201);
      expect(res.body.data.id).toBe('tour-1');
      expect(createAdminTour).toHaveBeenCalledWith(
      expect.objectContaining({
          creatorId: 'partner-1'
        }),
        expect.objectContaining({
          actor: 'partner-1'
        })
    );
  });

  it('GET /api/v1/admin/tours/:id should return a Tour', async () => {
    const app = createApp();

    vi.mocked(getAdminTourById).mockResolvedValue({
      id: 'tour-1',
      name: { vi: 'Tour Pho Co' },
      description: { vi: 'Kham pha pho co' },
      duration: 90,
      poiIds: ['poi-1', 'poi-2'],
      image: null,
      isPublished: true,
      publishedAt: new Date('2026-03-26T00:00:00Z').toISOString(),
      deletedAt: null,
      contentVersion: 1,
      createdAt: new Date('2026-03-26T00:00:00Z').toISOString(),
      updatedAt: new Date('2026-03-26T00:00:00Z').toISOString()
    } as never);

    const res = await request(app).get('/api/v1/admin/tours/tour-1').set('Authorization', ADMIN_AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('tour-1');
    expect(getAdminTourById).toHaveBeenCalledWith('tour-1', { actorId: 'admin-1', role: 'ADMIN' });
  });

  it('PUT /api/v1/admin/tours/:id should update Tour directly as PARTNER', async () => {
    const app = createApp();

    vi.mocked(verifyJwt).mockReturnValue({ sub: 'partner-1', role: 'PARTNER' });
    vi.mocked(getCurrentUserRole).mockResolvedValue('PARTNER');
    vi.mocked(updateAdminTour).mockResolvedValue({ id: 'tour-1' } as never);

    const res = await request(app)
      .put('/api/v1/admin/tours/tour-1')
      .set('Authorization', ADMIN_AUTH_HEADER)
      .send({ name: { vi: 'Tour Pho Co Moi' }, duration: 95 });

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('tour-1');
    expect(updateAdminTour).toHaveBeenCalledWith(
      'tour-1',
      expect.objectContaining({ name: { vi: 'Tour Pho Co Moi' } }),
      { actorId: 'partner-1', role: 'PARTNER' },
      expect.objectContaining({ actor: 'partner-1' })
    );
  });

  it('DELETE /api/v1/admin/tours/:id should delete Tour directly as PARTNER', async () => {
    const app = createApp();

    vi.mocked(verifyJwt).mockReturnValue({ sub: 'partner-1', role: 'PARTNER' });
    vi.mocked(getCurrentUserRole).mockResolvedValue('PARTNER');
    vi.mocked(deleteAdminTour).mockResolvedValue({ id: 'tour-1' } as never);

    const res = await request(app).delete('/api/v1/admin/tours/tour-1').set('Authorization', ADMIN_AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('tour-1');
    expect(deleteAdminTour).toHaveBeenCalledWith(
      'tour-1',
      { actorId: 'partner-1', role: 'PARTNER' },
      expect.objectContaining({ actor: 'partner-1' })
    );
  });

  it('POST /api/v1/admin/sync/invalidate should bump sync version', async () => {
    const app = createApp();

    vi.mocked(invalidateSyncManifest).mockResolvedValue({
      invalidated: true,
      syncVersion: 99
    });

    const res = await request(app)
      .post('/api/v1/admin/sync/invalidate')
      .set('Authorization', ADMIN_AUTH_HEADER)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.invalidated).toBe(true);
    expect(res.body.syncVersion).toBe(99);
    expect(invalidateSyncManifest).toHaveBeenCalledTimes(1);
  });

  it('POST /api/v1/admin/maintenance/pois/soft-delete-cleanup should run retention cleanup', async () => {
    const app = createApp();

    vi.mocked(purgeSoftDeletedPois).mockResolvedValue({
      dryRun: false,
      retentionDays: 90,
      cutoffAt: '2026-01-01T00:00:00.000Z',
      scanned: 2,
      purged: 2,
      deletedIds: ['poi-1', 'poi-2'],
      audioFilesRemoved: 4,
      imagesRemoved: 1,
      imageCleanupFailed: 0
    });

    const res = await request(app)
      .post('/api/v1/admin/maintenance/pois/soft-delete-cleanup')
      .set('Authorization', ADMIN_AUTH_HEADER)
      .send({ dryRun: false, reason: 'manual maintenance' });

    expect(res.status).toBe(200);
    expect(res.body.purged).toBe(2);
    expect(purgeSoftDeletedPois).toHaveBeenCalledWith(
      expect.objectContaining({
        dryRun: false,
        context: expect.objectContaining({
          source: 'api'
        })
      })
    );
  });

  it('POST /api/v1/admin/users/:id/role should assign USER to PARTNER', async () => {
    const app = createApp();

    vi.mocked(assignAdminUserRole).mockResolvedValue({
      id: 'user-2',
      email: 'target@example.com',
      role: 'PARTNER',
      previousRole: 'USER',
      reason: 'promote partner',
      reauthRequired: true
    });

    const res = await request(app)
      .post('/api/v1/admin/users/user-2/role')
      .set('Authorization', ADMIN_AUTH_HEADER)
      .send({ role: 'PARTNER', reason: 'promote partner' });

    expect(res.status).toBe(200);
    expect(res.body.role).toBe('PARTNER');
    expect(assignAdminUserRole).toHaveBeenCalledWith({
      actorId: 'admin-1',
      targetUserId: 'user-2',
      nextRole: 'PARTNER',
      reason: 'promote partner'
    });
  });

  it('POST /api/v1/admin/users/:id/role should return 403 when caller is PARTNER', async () => {
    const app = createApp();
    vi.mocked(verifyJwt).mockReturnValue({ sub: 'partner-1', role: 'PARTNER' });

    const res = await request(app)
      .post('/api/v1/admin/users/user-2/role')
      .set('Authorization', ADMIN_AUTH_HEADER)
      .send({ role: 'USER' });

    expect(res.status).toBe(403);
    expect(assignAdminUserRole).not.toHaveBeenCalled();
  });

  it('POST /api/v1/admin/users/:id/role/revoke should downgrade to USER', async () => {
    const app = createApp();

    vi.mocked(revokeAdminUserRole).mockResolvedValue({
      id: 'user-2',
      email: 'target@example.com',
      role: 'USER',
      previousRole: 'ADMIN',
      reason: 'revoke elevated role',
      reauthRequired: true
    });

    const res = await request(app)
      .post('/api/v1/admin/users/user-2/role/revoke')
      .set('Authorization', ADMIN_AUTH_HEADER)
      .send({ reason: 'revoke elevated role' });

    expect(res.status).toBe(200);
    expect(res.body.role).toBe('USER');
    expect(revokeAdminUserRole).toHaveBeenCalledWith({
      actorId: 'admin-1',
      targetUserId: 'user-2',
      reason: 'revoke elevated role'
    });
  });

  it('GET /api/v1/admin/users should filter users by role', async () => {
    const app = createApp();

    vi.mocked(listAdminUsers).mockResolvedValue([
      {
        id: 'user-1',
        email: 'user1@example.com',
        fullName: 'User One',
        role: 'PARTNER',
        isActive: true,
        createdAt: '2026-04-08T00:00:00.000Z',
        updatedAt: '2026-04-08T00:00:00.000Z'
      }
    ]);

    const res = await request(app)
      .get('/api/v1/admin/users?role=PARTNER')
      .set('Authorization', ADMIN_AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(listAdminUsers).toHaveBeenCalledWith({ role: 'PARTNER' });
  });
});
