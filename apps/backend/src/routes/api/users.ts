import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middlewares/authMiddleware';
import asyncHandler from '../../utils/asyncHandler';
import ApiError from '../../utils/ApiError';
import { getUserProfile, updateUserProfile, getUserFavoritePois } from '../../services/userService';

const router = Router();

function requireUserId(req: AuthRequest): string {
  const userId = req.user?.sub;
  if (!userId) {
    throw new ApiError(401, 'Token rỗng hoặc không hợp lệ.');
  }
  return userId;
}

/**
 * GET /api/v1/users/me
 * @summary Get current user profile
 * @description Retrieve profile information for authenticated user
 * @tags Users
 * @security bearerAuth
 * @return {object} 200 - User profile
 * @return {object} 401 - Unauthorized
 * @return {object} 404 - User not found
 * @return {object} 500 - Internal Server Error
 */
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = requireUserId(req);
    const user = await getUserProfile(userId);
    return res.status(200).json({
      status: 'success',
      data: user
    });
  })
);

/**
 * PATCH /api/v1/users/me
 * @summary Update current user profile
 * @description Update profile information for authenticated user
 * @tags Users
 * @security bearerAuth
 * @param {object} request.body - Profile update fields
 * @param {string} request.body.fullName - New full name
 * @param {string} request.body.preferredLanguage - Preferred language code
 * @return {object} 200 - Updated profile
 * @return {object} 400 - Invalid payload
 * @return {object} 401 - Unauthorized
 * @return {object} 500 - Internal Server Error
 */
router.patch(
  '/me',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = requireUserId(req);
    const { fullName, preferredLanguage } = req.body;

    const user = await updateUserProfile(userId, {
      fullName,
      preferredLanguage,
    });
    return res.status(200).json({
      message: 'Cập nhật hồ sơ thành công.',
      data: user
    });
  })
);

/**
 * GET /api/v1/users/me/favorites
 * @summary Get user's favorite POIs
 * @description Retrieve list of POIs saved by user
 * @tags Users
 * @security bearerAuth
 * @param {number} page.query - Page number (default: 1)
 * @param {number} limit.query - Items per page (default: 20)
 * @return {object} 200 - Favorite POIs list
 * @return {object} 401 - Unauthorized
 * @return {object} 500 - Internal Server Error
 */
router.get(
  '/me/favorites',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = requireUserId(req);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const data = await getUserFavoritePois(userId, page, limit);
    return res.status(200).json({
      status: 'success',
      data
    });
  })
);

export default router;
