import { Router } from 'express';
import { getPublicTours, getPublicTourById } from '../../services/tourPublicService';
import { isUserPremium } from '../../services/authService';
import { requireAuth, AuthRequest } from '../../middlewares/authMiddleware';
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

/**
 * GET /api/v1/tours
 * @summary Get all tours
 * @description Retrieve paginated list of Food Tours available to user's subscription level
 * @tags Tours
 * @param {number} page.query - Page number (default: 1)
 * @param {number} limit.query - Items per page (default: 20, max: 100)
 * @return {object} 200 - Success response with tours array
 * @return {object} 401 - Unauthorized
 * @return {object} 500 - Internal Server Error
 */
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const isPremium = await isUserPremium(req.user?.sub);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const data = await getPublicTours(page, limit, isPremium);
    return res.status(200).json({
      status: 'success',
      data
    });
  })
);

/**
 * GET /api/v1/tours/:id
 * @summary Get tour by ID
 * @description Retrieve detailed information about a specific Food Tour including its POI sequence
 * @tags Tours
 * @param {string} id.path - Tour identifier
 * @return {object} 200 - Success response with tour detail
 * @return {object} 401 - Unauthorized
 * @return {object} 404 - Tour not found
 * @return {object} 500 - Internal Server Error
 */
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const isPremium = await isUserPremium(req.user?.sub);
    const id = String(req.params.id);

    const data = await getPublicTourById(id, isPremium);
    return res.status(200).json({
      status: 'success',
      data
    });
  })
);

export default router;
