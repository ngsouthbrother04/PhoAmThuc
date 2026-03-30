import { Router } from 'express';
import { getSyncFull, getSyncManifest } from '../../services/syncService';
import { requireAuth } from '../../middlewares/authMiddleware';
import asyncHandler from '../../utils/asyncHandler';
import ApiError from '../../utils/ApiError';

const router = Router();

router.get(
  '/manifest',
  asyncHandler(async (req, res) => {
    const manifest = await getSyncManifest();
    return res.status(200).json(manifest);
  })
);

router.get(
  '/full',
  requireAuth,
  asyncHandler(async (req, res) => {

    const requestedVersionRaw = typeof req.query.version === 'string' ? req.query.version : undefined;
    const requestedVersion = requestedVersionRaw ? Number(requestedVersionRaw) : undefined;

    if (requestedVersionRaw && !Number.isInteger(requestedVersion)) {
      throw new ApiError(400, 'Query version phải là số nguyên.');
    }

    if (requestedVersion !== undefined) {
      const manifest = await getSyncManifest();
      if (requestedVersion >= manifest.contentVersion) {
        return res.status(200).json({
          contentVersion: manifest.contentVersion,
          needsSync: false,
          pois: [],
          tours: []
        });
      }
    }

    const fullData = await getSyncFull();
    return res.status(200).json({
      ...fullData,
      needsSync: true
    });
  })
);

export default router;
