import { type RequestHandler, Router } from 'express';
import multer from 'multer';
import asyncHandler from '../../utils/asyncHandler';
import ApiError from '../../utils/ApiError';
import { getCurrentUserRole, isAccessTokenSessionActive, verifyJwt } from '../../services/authService';
import { uploadPoiImage, uploadTourImage } from '../../services/imageService';
import {
  createAdminPoi,
  createAdminTour,
  deleteAdminPoi,
  deleteAdminTour,
  getAdminPoiById,
  getAdminTourById,
  updateAdminPoi,
  updateAdminTour
} from '../../services/poiAdminService';

const router = Router();
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.CLOUDINARY_MAX_IMAGE_BYTES ?? 5 * 1024 * 1024)
  }
});

const handleImageUpload: RequestHandler = (req, res, next) => {
  imageUpload.single('image')(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        next(new ApiError(400, 'Kich thuoc anh vuot qua gioi han cho phep.'));
        return;
      }

      next(new ApiError(400, 'Upload anh khong hop le.'));
      return;
    }

    next(err);
  });
};

async function assertPartnerAccess(req: { headers: Record<string, unknown> }): Promise<{ actorId: string }> {
  const authHeader = typeof req.headers.authorization === 'string' ? req.headers.authorization : '';
  const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : '';

  if (!accessToken) {
    throw new ApiError(403, 'Không có quyền truy cập partner endpoint.');
  }

  const payload = verifyJwt(accessToken) as { sub?: string; role?: string };
  const isActive = await isAccessTokenSessionActive(accessToken);
  if (!isActive || typeof payload.sub !== 'string' || !payload.sub.trim()) {
    throw new ApiError(403, 'Phiên đăng nhập không hợp lệ.');
  }

  const actorId = payload.sub.trim();
  const currentRole = await getCurrentUserRole(actorId);
  if (currentRole !== 'PARTNER') {
    throw new ApiError(403, 'Chỉ PARTNER mới được sử dụng endpoint này.');
  }

  return { actorId };
}

function extractCrudPayload(body: unknown): Record<string, unknown> {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new ApiError(400, 'payload phải là object JSON hợp lệ.');
  }

  return body as Record<string, unknown>;
}

router.post(
  '/pois/:id/image/upload',
  handleImageUpload,
  asyncHandler(async (req, res) => {
    const auth = await assertPartnerAccess(req);
    const poiId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!poiId) {
      throw new ApiError(400, 'Thiếu POI id cần upload ảnh.');
    }

    if (!req.file) {
      throw new ApiError(400, 'Thiếu file ảnh với field image.');
    }

    if (!req.file.mimetype.startsWith('image/')) {
      throw new ApiError(400, 'Chi chap nhan file anh hop le.');
    }

    await getAdminPoiById(poiId, { actorId: auth.actorId, role: 'PARTNER' });
    const result = await uploadPoiImage(poiId, req.file);
    return res.status(200).json({
      message: 'Upload ảnh thành công.',
      ...result
    });
  })
);

router.post(
  '/tours/:id/image/upload',
  handleImageUpload,
  asyncHandler(async (req, res) => {
    const auth = await assertPartnerAccess(req);
    const tourId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!tourId) {
      throw new ApiError(400, 'Thiếu Tour id cần upload ảnh.');
    }

    if (!req.file) {
      throw new ApiError(400, 'Thiếu file ảnh với field image.');
    }

    if (!req.file.mimetype.startsWith('image/')) {
      throw new ApiError(400, 'Chi chap nhan file anh hop le.');
    }

    await getAdminTourById(tourId, { actorId: auth.actorId, role: 'PARTNER' });
    const result = await uploadTourImage(tourId, req.file);
    return res.status(200).json({
      message: 'Upload ảnh thành công.',
      ...result
    });
  })
);

router.post(
  '/pois',
  asyncHandler(async (req, res) => {
    const auth = await assertPartnerAccess(req);
    const payload = extractCrudPayload(req.body);
    const reason = typeof payload.reason === 'string' ? payload.reason : undefined;
    const createdPoi = await createAdminPoi(
      {
        ...(payload as Record<string, unknown>),
        creatorId: auth.actorId
      } as any,
      {
        actor: auth.actorId,
        reason,
        source: 'partner-api'
      }
    );

    return res.status(201).json({
      message: 'Tạo POI thành công.',
      data: createdPoi
    });
  })
);

router.put(
  '/pois/:id',
  asyncHandler(async (req, res) => {
    const auth = await assertPartnerAccess(req);
    const poiId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!poiId) {
      throw new ApiError(400, 'Thiếu POI id.');
    }

    const payload = extractCrudPayload(req.body);
    const reason = typeof payload.reason === 'string' ? payload.reason : undefined;
    const updatedPoi = await updateAdminPoi(
      poiId,
      payload,
      { actorId: auth.actorId, role: 'PARTNER' },
      {
        actor: auth.actorId,
        reason,
        source: 'partner-api'
      }
    );

    return res.status(200).json({
      message: 'Cập nhật POI thành công.',
      data: updatedPoi
    });
  })
);

router.delete(
  '/pois/:id',
  asyncHandler(async (req, res) => {
    const auth = await assertPartnerAccess(req);
    const poiId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!poiId) {
      throw new ApiError(400, 'Thiếu POI id.');
    }

    const reason = typeof req.body?.reason === 'string' ? req.body.reason : undefined;
    const deletedPoi = await deleteAdminPoi(
      poiId,
      { actorId: auth.actorId, role: 'PARTNER' },
      {
        actor: auth.actorId,
        reason,
        source: 'partner-api'
      }
    );

    return res.status(200).json({
      message: 'Xóa POI thành công.',
      data: deletedPoi
    });
  })
);

router.post(
  '/tours',
  asyncHandler(async (req, res) => {
    const auth = await assertPartnerAccess(req);
    const payload = extractCrudPayload(req.body);
    const reason = typeof payload.reason === 'string' ? payload.reason : undefined;
    const createdTour = await createAdminTour(
      {
        ...(payload as Record<string, unknown>),
        creatorId: auth.actorId
      } as any,
      {
        actor: auth.actorId,
        reason,
        source: 'partner-api'
      }
    );

    return res.status(201).json({
      message: 'Tạo Tour thành công.',
      data: createdTour
    });
  })
);

router.put(
  '/tours/:id',
  asyncHandler(async (req, res) => {
    const auth = await assertPartnerAccess(req);
    const tourId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!tourId) {
      throw new ApiError(400, 'Thiếu Tour id.');
    }

    const payload = extractCrudPayload(req.body);
    const reason = typeof payload.reason === 'string' ? payload.reason : undefined;
    const updatedTour = await updateAdminTour(
      tourId,
      payload,
      { actorId: auth.actorId, role: 'PARTNER' },
      {
        actor: auth.actorId,
        reason,
        source: 'partner-api'
      }
    );

    return res.status(200).json({
      message: 'Cập nhật Tour thành công.',
      data: updatedTour
    });
  })
);

router.delete(
  '/tours/:id',
  asyncHandler(async (req, res) => {
    const auth = await assertPartnerAccess(req);
    const tourId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!tourId) {
      throw new ApiError(400, 'Thiếu Tour id.');
    }

    const reason = typeof req.body?.reason === 'string' ? req.body.reason : undefined;
    const deletedTour = await deleteAdminTour(
      tourId,
      { actorId: auth.actorId, role: 'PARTNER' },
      {
        actor: auth.actorId,
        reason,
        source: 'partner-api'
      }
    );

    return res.status(200).json({
      message: 'Xóa Tour thành công.',
      data: deletedTour
    });
  })
);

export default router;
