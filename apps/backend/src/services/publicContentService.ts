import prisma from "../lib/prisma";
import ApiError from "../utils/ApiError";

const SUPPORTED_LANG_PATHS = ["vi", "en", "ko", "zh", "ja", "th"] as const;

/**
 * Get featured POIs (top-rated or recently published)
 */
export async function getFeaturedPois(limit: number, isPremium: boolean) {
  const pois = await prisma.pointOfInterest.findMany({
    where: {
      isPublished: true,
      deletedAt: null,
    },
    take: limit,
    orderBy: {
      publishedAt: "desc",
    },
    select: {
      id: true,
      name: true,
      description: true,
      latitude: true,
      longitude: true,
      type: true,
      image: true,
      audioUrls: true,
      isPublished: true,
    },
  });

  return pois;
}

/**
 * Get featured tours (recently published or popular)
 */
export async function getFeaturedTours(limit: number, isPremium: boolean) {
  const tours = await prisma.tour.findMany({
    where: {
      isPublished: true,
      deletedAt: null,
    },
    take: limit,
    orderBy: {
      publishedAt: "desc",
    },
    select: {
      id: true,
      name: true,
      description: true,
      duration: true,
      poiIds: true,
      image: true,
      isPublished: true,
    },
  });

  // Add POI count
  const toursWithCount = tours.map((tour) => ({
    ...tour,
    poiCount: (tour.poiIds as unknown as string[])?.length || 0,
  }));

  return toursWithCount;
}

/**
 * Global search across POIs and tours
 */
export async function searchContent(
  query: string,
  types: string[],
  limit: number,
  isPremium: boolean,
) {
  const buildLocalizedJsonSearch = (field: "name" | "description") =>
    SUPPORTED_LANG_PATHS.map((lang) => ({
      [field]: {
        path: [lang],
        string_contains: query,
        mode: "insensitive" as const,
      },
    }));

  const searchTypes = types.filter((t) => ["poi", "tour"].includes(t));

  const results: { pois: any[]; tours: any[] } = {
    pois: [],
    tours: [],
  };

  if (searchTypes.includes("poi")) {
    const pois = await prisma.pointOfInterest.findMany({
      where: {
        AND: [
          { isPublished: true },
          { deletedAt: null },
          {
            OR: [
              ...buildLocalizedJsonSearch("name"),
              ...buildLocalizedJsonSearch("description"),
            ],
          },
        ],
      },
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        image: true,
        latitude: true,
        longitude: true,
      },
    });
    results.pois = pois;
  }

  if (searchTypes.includes("tour")) {
    const tours = await prisma.tour.findMany({
      where: {
        AND: [
          { isPublished: true },
          { deletedAt: null },
          {
            OR: [
              ...buildLocalizedJsonSearch("name"),
              ...buildLocalizedJsonSearch("description"),
            ],
          },
        ],
      },
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
        poiIds: true,
        image: true,
      },
    });
    results.tours = tours;
  }

  return results;
}

/**
 * Get POIs within geographic bounds
 */
export async function getPoisByBounds(
  north: number,
  south: number,
  east: number,
  west: number,
  limit: number,
  isPremium: boolean,
) {
  const pois = await prisma.pointOfInterest.findMany({
    where: {
      AND: [
        { isPublished: true },
        { deletedAt: null },
        { latitude: { gte: south, lte: north } },
        { longitude: { gte: west, lte: east } },
      ],
    },
    take: limit,
    select: {
      id: true,
      name: true,
      type: true,
      latitude: true,
      longitude: true,
      image: true,
      audioUrls: true,
    },
  });

  return pois;
}
