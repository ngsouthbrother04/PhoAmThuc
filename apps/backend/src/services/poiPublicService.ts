import { PoiType, Prisma } from '../generated/prisma/client';
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

export interface PublicPoiItem {
  id: string;
  name: unknown;
  description: unknown;
  audioUrls: unknown;
  latitude: number;
  longitude: number;
  type: string;
  image: string | null;
}

export interface PaginatedPoiResult {
  items: PublicPoiItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getPublicPois(page: number, limit: number, isPremium: boolean = false): Promise<PaginatedPoiResult> {
  const skip = (page - 1) * limit;

  const [total, pois] = await Promise.all([
    prisma.pointOfInterest.count({
      where: { deletedAt: null, isPublished: true }
    }),
    prisma.pointOfInterest.findMany({
      where: { deletedAt: null, isPublished: true },
      orderBy: { id: 'asc' },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
        audioUrls: true,
        latitude: true,
        longitude: true,
        type: true,
        image: true
      }
    })
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    items: pois.map(poi => ({
      id: poi.id,
      name: isPremium ? poi.name : stripPremiumLanguages(poi.name),
      description: isPremium ? poi.description : stripPremiumLanguages(poi.description),
      audioUrls: isPremium ? poi.audioUrls : stripPremiumLanguages(poi.audioUrls),
      latitude: Number(poi.latitude),
      longitude: Number(poi.longitude),
      type: poi.type,
      image: poi.image
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
}

export async function getPublicPoiById(id: string, isPremium: boolean = false): Promise<PublicPoiItem> {
  const poi = await prisma.pointOfInterest.findFirst({
    where: { id, deletedAt: null, isPublished: true },
    select: {
      id: true,
      name: true,
      description: true,
      audioUrls: true,
      latitude: true,
      longitude: true,
      type: true,
      image: true
    }
  });

  if (!poi) {
    throw new ApiError(404, 'Khong tim thay poi');
  }

  return {
    id: poi.id,
    name: isPremium ? poi.name : stripPremiumLanguages(poi.name),
    description: isPremium ? poi.description : stripPremiumLanguages(poi.description),
    audioUrls: isPremium ? poi.audioUrls : stripPremiumLanguages(poi.audioUrls),
    latitude: Number(poi.latitude),
    longitude: Number(poi.longitude),
    type: poi.type,
    image: poi.image
  };
}

export async function searchPoisByRadius(
  latitude: number,
  longitude: number,
  radiusM: number,
  limit: number,
  isPremium: boolean = false
): Promise<any> {
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180 || radiusM <= 0) {
    throw new ApiError(400, 'Latitude/longitude/radius khong hop le');
  }

  // Use raw PostgreSQL + PostGIS query assuming latitude/longitude are stored properly or using ST_DWithin if geometric structures exist.
  // Given schema: latitude and longitude are Decimal(9,6). We can use earthdistance or just basic query,
  // but let's query all and do haversine in JS for simplicity unless there are millions of records.
  
  // Since db has type `Decimal`, we can approximate bounding box or simply fetch and sort.
  // But let's write a Prisma raw query using earthdistance or math.
  // Actually, standard practice without Postgis is to do memory filtering if dataset is small, or bounding box.
  // Let's implement the memory one since POIs in MVP are assumed to be < 10,000 for a single food street.

  const pois = await prisma.pointOfInterest.findMany({
    where: { deletedAt: null, isPublished: true },
    select: {
      id: true,
      name: true,
      description: true,
      audioUrls: true,
      latitude: true,
      longitude: true,
      type: true,
      image: true
    }
  });

  const R = 6371e3; // metres
  const toRad = (val: number) => (val * Math.PI) / 180;

  const results = [];
  for (const poi of pois) {
    const lat2 = Number(poi.latitude);
    const lon2 = Number(poi.longitude);

    const phi1 = toRad(latitude);
    const phi2 = toRad(lat2);
    const deltaPhi = toRad(lat2 - latitude);
    const deltaLambda = toRad(lon2 - longitude);

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;

    if (distance <= radiusM) {
      results.push({
        id: poi.id,
        name: isPremium ? poi.name : stripPremiumLanguages(poi.name),
        description: isPremium ? poi.description : stripPremiumLanguages(poi.description),
        audioUrls: isPremium ? poi.audioUrls : stripPremiumLanguages(poi.audioUrls),
        latitude: lat2,
        longitude: lon2,
        distance,
        type: poi.type,
        image: poi.image
      });
    }
  }

  results.sort((a, b) => (a.distance || 0) - (b.distance || 0));

  return {
    items: results.slice(0, limit),
    meta: {
      radiusM,
      center: { latitude, longitude }
    }
  };
}
