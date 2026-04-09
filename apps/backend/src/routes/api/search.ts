import { Router } from "express";
import { isUserPremium } from "../../services/authService";
import { requireAuth, AuthRequest } from "../../middlewares/authMiddleware";
import asyncHandler from "../../utils/asyncHandler";
import ApiError from "../../utils/ApiError";
import { searchContent } from "../../services/publicContentService";

const router = Router();

function requireUserId(req: AuthRequest): string {
  const userId = req.user?.sub;
  if (!userId) {
    throw new ApiError(401, "Token rỗng hoặc không hợp lệ.");
  }
  return userId;
}

/**
 * GET /api/v1/search
 * @summary Global search across POIs and tours
 * @description Search for POIs and tours by query string
 * @tags Search
 * @security bearerAuth
 * @param {string} q.query.required - Search query
 * @param {string} type.query - Comma-separated types (poi,tour; default: both)
 * @param {number} limit.query - Max results per type (default: 20)
 * @return {object} 200 - Search results
 * @return {object} 400 - Missing query parameter
 * @return {object} 401 - Unauthorized
 * @return {object} 500 - Internal Server Error
 */
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = requireUserId(req);
    const isPremium = await isUserPremium(userId);

    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!query || query.length < 2) {
      throw new ApiError(400, "Tìm kiếm phải ít nhất 2 ký tự.");
    }

    const typeParam =
      typeof req.query.type === "string" ? req.query.type : "poi,tour";
    const types = typeParam
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const results = await searchContent(query, types, limit, isPremium);

    return res.status(200).json({
      status: "success",
      query,
      results,
    });
  }),
);

export default router;
