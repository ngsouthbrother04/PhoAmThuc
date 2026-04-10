import prisma from "../lib/prisma";
import ApiError from "../utils/ApiError";

/**
 * Get user profile
 */
export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      preferredLanguage: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: { fullName?: string; preferredLanguage?: string },
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.fullName && { fullName: data.fullName }),
      ...(data.preferredLanguage && {
        preferredLanguage: data.preferredLanguage,
      }),
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      preferredLanguage: true,
      updatedAt: true,
    },
  });

  return user;
}

/**
 * Get user's favorite POIs (from separate favorites table/relation)
 */
export async function getUserFavoritePois(
  userId: string,
  page: number,
  limit: number,
) {
  // Check if we have a favorites table/relation
  // For now, return empty array - implement based on your schema

  const favorites = await prisma.pointOfInterest.findMany({
    where: {
      isPublished: true,
      deletedAt: null,
      // Add user favorite relation filter here when implemented
    },
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      name: true,
      description: true,
      latitude: true,
      longitude: true,
      type: true,
      image: true,
      audioUrls: true,
    },
  });

  const total = await prisma.pointOfInterest.count({
    where: {
      isPublished: true,
      deletedAt: null,
      // Add user favorite relation filter here when implemented
    },
  });

  return {
    items: favorites,
    total,
    page,
    pageSize: limit,
    pages: Math.ceil(total / limit),
  };
}
