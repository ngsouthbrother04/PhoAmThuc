import { Prisma } from '../generated/prisma/client';
import prisma from '../lib/prisma';
import ApiError from '../utils/ApiError';

const ALLOWED_FREEMIUM_LANGS = ['vi', 'en'];

function stripPremiumLanguages(data: any): any {
  if (!data || typeof data !== 'object') return data;
  const filtered: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    if (ALLOWED_FREEMIUM_LANGS.includes(k)) {
      filtered[k] = v;
    }
  }
  return filtered;
}

export interface PublicTourItem {
  id: string;
  name: unknown;
  description: unknown;
  duration: number;
  poiIds: string[];
  image: string | null;
}

export interface PaginatedTourResult {
  items: PublicTourItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getPublicTours(page: number = 1, limit: number = 20, isPremium: boolean = false): Promise<PaginatedTourResult> {
  const skip = (page - 1) * limit;

  const [total, tours] = await Promise.all([
    prisma.tour.count({
      where: { deletedAt: null, isPublished: true }
    }),
    prisma.tour.findMany({
      where: { deletedAt: null, isPublished: true },
      orderBy: { id: 'asc' },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
        duration: true,
        poiIds: true,
        image: true
      }
    })
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    items: tours.map(tour => ({
      id: tour.id,
      name: isPremium ? tour.name : stripPremiumLanguages(tour.name),
      description: isPremium ? tour.description : stripPremiumLanguages(tour.description),
      duration: tour.duration,
      poiIds: Array.isArray(tour.poiIds) ? tour.poiIds as string[] : [],
      image: tour.image
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
}

export async function getPublicTourById(id: string, isPremium: boolean = false): Promise<PublicTourItem> {
  const tour = await prisma.tour.findFirst({
    where: { id, deletedAt: null, isPublished: true },
    select: {
      id: true,
      name: true,
      description: true,
      duration: true,
      poiIds: true,
      image: true
    }
  });

  if (!tour) {
    throw new ApiError(404, 'Khong tim thay tour');
  }

  return {
    id: tour.id,
    name: isPremium ? tour.name : stripPremiumLanguages(tour.name),
    description: isPremium ? tour.description : stripPremiumLanguages(tour.description),
    duration: tour.duration,
    poiIds: Array.isArray(tour.poiIds) ? tour.poiIds as string[] : [],
    image: tour.image
  };
}
