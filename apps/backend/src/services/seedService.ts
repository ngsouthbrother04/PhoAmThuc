import { AnalyticsAction, PoiType } from '../generated/prisma/client';

const SUPPORTED_LANGS = ['vi', 'en', 'ko', 'zh', 'ja', 'th'] as const;

export interface SeedPoi {
  id: string;
  slug: string;
  name: Record<string, string>;
  description: Record<string, string>;
  audioUrls: Record<string, string>;
  latitude: string;
  longitude: string;
  type: PoiType;
  image: string;
  contentVersion: number;
}

export interface SeedTour {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  duration: number;
  poiIds: string[];
  image: string;
  contentVersion: number;
}

export interface SeedAnalyticsEvent {
  deviceId: string;
  sessionId: string;
  poiId: string;
  action: AnalyticsAction;
  durationMs: number;
  language: string;
  timestamp: bigint;
  uploaded: boolean;
}

export interface SeedDataset {
  pois: SeedPoi[];
  tours: SeedTour[];
  analyticsEvents: SeedAnalyticsEvent[];
}

function localize(baseVi: string, baseEn: string): Record<string, string> {
  return {
    vi: baseVi,
    en: baseEn,
    ko: `${baseEn} (KO)`,
    zh: `${baseEn} (ZH)`,
    ja: `${baseEn} (JA)`,
    th: `${baseEn} (TH)`
  };
}

function buildAudioUrls(slug: string): Record<string, string> {
  return SUPPORTED_LANGS.reduce<Record<string, string>>((acc, lang) => {
    acc[lang] = `https://cdn.phoamthuc.local/audio/${lang}/${slug}.mp3`;
    return acc;
  }, {});
}

function validateCoordinates(poi: SeedPoi): void {
  const lat = Number.parseFloat(poi.latitude);
  const lon = Number.parseFloat(poi.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error(`Invalid coordinates for ${poi.id}`);
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new Error(`Coordinates out of range for ${poi.id}`);
  }
}

export function buildSeedDataset(contentVersion = 1, nowMs = Date.now()): SeedDataset {
  const pois: SeedPoi[] = [
    {
      id: 'poi-uuid-1',
      slug: 'pho-thin-lo-duc',
      name: localize('Phở Hòa Pasteur', 'Pho Hoa Pasteur'),
      description: localize('Phở bò nổi tiếng khu trung tâm TP.HCM', 'Famous beef pho in central Ho Chi Minh City'),
      audioUrls: buildAudioUrls('pho-thin-lo-duc'),
      latitude: '10.780420',
      longitude: '106.693260',
      type: PoiType.FOOD,
      image: 'https://cdn.phoamthuc.local/poi/pho-thin-lo-duc.jpg',
      contentVersion
    },
    {
      id: 'poi-uuid-2',
      slug: 'bun-cha-huong-lien',
      name: localize('Bún thịt nướng Chị Tuyền', 'Chi Tuyen Grilled Pork Vermicelli'),
      description: localize('Bún thịt nướng kiểu Nam Bộ đậm vị', 'Southern-style grilled pork vermicelli'),
      audioUrls: buildAudioUrls('bun-cha-huong-lien'),
      latitude: '10.776030',
      longitude: '106.695180',
      type: PoiType.FOOD,
      image: 'https://cdn.phoamthuc.local/poi/bun-cha-huong-lien.jpg',
      contentVersion
    },
    {
      id: 'poi-uuid-3',
      slug: 'ca-phe-giang',
      name: localize('Cà phê bệt Nhà Thờ Đức Bà', 'Notre Dame Sidewalk Coffee'),
      description: localize('Điểm cà phê đặc trưng của trung tâm Sài Gòn', 'A signature coffee stop in central Saigon'),
      audioUrls: buildAudioUrls('ca-phe-giang'),
      latitude: '10.780950',
      longitude: '106.699160',
      type: PoiType.DRINK,
      image: 'https://cdn.phoamthuc.local/poi/ca-phe-giang.jpg',
      contentVersion
    },
    {
      id: 'poi-uuid-4',
      slug: 'banh-mi-25',
      name: localize('Bánh mì Huỳnh Hoa', 'Huynh Hoa Banh Mi'),
      description: localize('Bánh mì nổi tiếng với nhân đầy đặn tại quận 1', 'Famous district 1 banh mi with generous filling'),
      audioUrls: buildAudioUrls('banh-mi-25'),
      latitude: '10.770940',
      longitude: '106.693730',
      type: PoiType.SNACK,
      image: 'https://cdn.phoamthuc.local/poi/banh-mi-25.jpg',
      contentVersion
    },
    {
      id: 'poi-uuid-5',
      slug: 'xoi-yen',
      name: localize('Xôi gà Number One', 'Number One Chicken Sticky Rice'),
      description: localize('Xôi nóng nhiều topping, phù hợp ăn khuya Sài Gòn', 'Hot sticky rice with toppings, great for late-night Saigon eats'),
      audioUrls: buildAudioUrls('xoi-yen'),
      latitude: '10.787820',
      longitude: '106.687150',
      type: PoiType.FOOD,
      image: 'https://cdn.phoamthuc.local/poi/xoi-yen.jpg',
      contentVersion
    },
    {
      id: 'poi-uuid-6',
      slug: 'cha-ca-thang-long',
      name: localize('Bún bò Huế Đông Ba', 'Dong Ba Hue Beef Noodles'),
      description: localize('Bún bò đậm vị tại khu vực quận Bình Thạnh', 'Rich Hue-style beef noodles in Binh Thanh area'),
      audioUrls: buildAudioUrls('cha-ca-thang-long'),
      latitude: '10.801830',
      longitude: '106.710230',
      type: PoiType.FOOD,
      image: 'https://cdn.phoamthuc.local/poi/cha-ca-thang-long.jpg',
      contentVersion
    },
    {
      id: 'poi-uuid-7',
      slug: 'nom-bo-kho-ho-hoan-kiem',
      name: localize('Gỏi khô bò Công viên Lê Văn Tám', 'Le Van Tam Dried Beef Salad'),
      description: localize('Gỏi khô bò chua ngọt cay kiểu Sài Gòn', 'Saigon-style sweet and tangy dried beef salad'),
      audioUrls: buildAudioUrls('nom-bo-kho-ho-hoan-kiem'),
      latitude: '10.787080',
      longitude: '106.696980',
      type: PoiType.SNACK,
      image: 'https://cdn.phoamthuc.local/poi/nom-bo-kho-ho-hoan-kiem.jpg',
      contentVersion
    },
    {
      id: 'poi-uuid-8',
      slug: 'che-4-mua',
      name: localize('Chè Hiển Khánh', 'Hien Khanh Dessert Shop'),
      description: localize('Quán chè lâu năm nổi bật khu quận 10, TP.HCM', 'Long-running dessert spot in district 10, Ho Chi Minh City'),
      audioUrls: buildAudioUrls('che-4-mua'),
      latitude: '10.772510',
      longitude: '106.667610',
      type: PoiType.SNACK,
      image: 'https://cdn.phoamthuc.local/poi/che-4-mua.jpg',
      contentVersion
    },
    {
      id: 'poi-uuid-9',
      slug: 'tra-da-via-he',
      name: localize('Trà tắc vỉa hè Bùi Viện', 'Bui Vien Street Citrus Tea'),
      description: localize('Điểm dừng chân giải khát bình dân khu trung tâm', 'Budget-friendly refreshment stop in the city center'),
      audioUrls: buildAudioUrls('tra-da-via-he'),
      latitude: '10.767420',
      longitude: '106.693180',
      type: PoiType.DRINK,
      image: 'https://cdn.phoamthuc.local/poi/tra-da-via-he.jpg',
      contentVersion
    },
    {
      id: 'poi-uuid-10',
      slug: 'public-rest-stop',
      name: localize('Diem dung tien ich', 'Public Rest Stop'),
      description: localize('Khu vệ sinh công cộng gần tuyến khám phá ẩm thực TP.HCM', 'Public restroom near Ho Chi Minh City food route'),
      audioUrls: buildAudioUrls('public-rest-stop'),
      latitude: '10.775860',
      longitude: '106.702070',
      type: PoiType.WC,
      image: 'https://cdn.phoamthuc.local/poi/public-rest-stop.jpg',
      contentVersion
    }
  ];

  pois.forEach((poi) => validateCoordinates(poi));

  const tours: SeedTour[] = [
    {
      id: 'tour-uuid-1',
      name: localize('Lo trinh Buoi Sang', 'Morning Route'),
      description: localize('Bua sang voi pho, bun cha va ca phe', 'Breakfast route with pho, bun cha and coffee'),
      duration: 120,
      poiIds: ['poi-uuid-1', 'poi-uuid-2', 'poi-uuid-3'],
      image: 'https://cdn.phoamthuc.local/tours/morning.jpg',
      contentVersion
    },
    {
      id: 'tour-uuid-2',
      name: localize('Lo trinh Pho Co', 'Old Quarter Walk'),
      description: localize('Kham pha mon an vat pho co', 'Street snack walk in old quarter'),
      duration: 95,
      poiIds: ['poi-uuid-4', 'poi-uuid-7', 'poi-uuid-8', 'poi-uuid-9'],
      image: 'https://cdn.phoamthuc.local/tours/old-quarter.jpg',
      contentVersion
    },
    {
      id: 'tour-uuid-3',
      name: localize('Lo trinh Gia dinh', 'Family Comfort Tour'),
      description: localize('Mon ngon de an va diem dung tien ich', 'Family-friendly stops with comfort food'),
      duration: 110,
      poiIds: ['poi-uuid-5', 'poi-uuid-6', 'poi-uuid-10'],
      image: 'https://cdn.phoamthuc.local/tours/family.jpg',
      contentVersion
    }
  ];

  const analyticsEvents: SeedAnalyticsEvent[] = [
    {
      deviceId: 'seed-device-001',
      sessionId: 'seed-session-001',
      poiId: 'poi-uuid-1',
      action: AnalyticsAction.PLAY,
      durationMs: 0,
      language: 'vi-VN',
      timestamp: BigInt(nowMs),
      uploaded: false
    },
    {
      deviceId: 'seed-device-001',
      sessionId: 'seed-session-001',
      poiId: 'poi-uuid-1',
      action: AnalyticsAction.PAUSE,
      durationMs: 18000,
      language: 'vi-VN',
      timestamp: BigInt(nowMs + 18_000),
      uploaded: false
    },
    {
      deviceId: 'seed-device-001',
      sessionId: 'seed-session-001',
      poiId: 'poi-uuid-2',
      action: AnalyticsAction.STOP,
      durationMs: 42000,
      language: 'en-US',
      timestamp: BigInt(nowMs + 42_000),
      uploaded: false
    },
    {
      deviceId: 'seed-device-002',
      sessionId: 'seed-session-002',
      poiId: 'poi-uuid-4',
      action: AnalyticsAction.QR_SCAN,
      durationMs: 0,
      language: 'ko-KR',
      timestamp: BigInt(nowMs + 55_000),
      uploaded: false
    },
    {
      deviceId: 'seed-device-003',
      sessionId: 'seed-session-003',
      poiId: 'poi-uuid-6',
      action: AnalyticsAction.PLAY,
      durationMs: 0,
      language: 'zh-CN',
      timestamp: BigInt(nowMs + 70_000),
      uploaded: false
    }
  ];

  return {
    pois,
    tours,
    analyticsEvents
  };
}
