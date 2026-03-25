/// <reference types="node" />
import "dotenv/config";
import { PrismaClient, PoiType, AnalyticsAction } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const poi1 = await prisma.pointOfInterest.upsert({
    where: { id: "poi-uuid-1" },
    update: {
      name: { vi: "Pho Thin Lo Duc", en: "Pho Thin Lo Duc" },
      description: {
        vi: "Pho bo xao lan dac trung Ha Noi",
        en: "Classic Hanoi stir-fried beef pho",
      },
      audioUrls: {
        vi: "https://cdn.phoamthuc.local/audio/vi/pho-thin.mp3",
        en: "https://cdn.phoamthuc.local/audio/en/pho-thin.mp3",
      },
      latitude: "21.016300",
      longitude: "105.855700",
      type: PoiType.FOOD,
      image: "https://cdn.phoamthuc.local/poi/pho-thin.jpg",
      contentVersion: 1,
    },
    create: {
      id: "poi-uuid-1",
      name: { vi: "Pho Thin Lo Duc", en: "Pho Thin Lo Duc" },
      description: {
        vi: "Pho bo xao lan dac trung Ha Noi",
        en: "Classic Hanoi stir-fried beef pho",
      },
      audioUrls: {
        vi: "https://cdn.phoamthuc.local/audio/vi/pho-thin.mp3",
        en: "https://cdn.phoamthuc.local/audio/en/pho-thin.mp3",
      },
      latitude: "21.016300",
      longitude: "105.855700",
      type: PoiType.FOOD,
      image: "https://cdn.phoamthuc.local/poi/pho-thin.jpg",
      contentVersion: 1,
    },
  });

  await prisma.tour.upsert({
    where: { id: "tour-uuid-1" },
    update: {
      name: { vi: "Lo trinh Buoi Sang", en: "Morning Route" },
      description: {
        vi: "Bua sang voi pho va ca phe",
        en: "Morning food route with pho and coffee",
      },
      duration: 90,
      poiIds: [poi1.id],
      image: "https://cdn.phoamthuc.local/tours/morning.jpg",
      contentVersion: 1,
    },
    create: {
      id: "tour-uuid-1",
      name: { vi: "Lo trinh Buoi Sang", en: "Morning Route" },
      description: {
        vi: "Bua sang voi pho va ca phe",
        en: "Morning food route with pho and coffee",
      },
      duration: 90,
      poiIds: [poi1.id],
      image: "https://cdn.phoamthuc.local/tours/morning.jpg",
      contentVersion: 1,
    },
  });

  await prisma.analyticsEvent.create({
    data: {
      deviceId: "seed-device-001",
      sessionId: "seed-session-001",
      poiId: poi1.id,
      action: AnalyticsAction.PLAY,
      durationMs: 0,
      language: "vi-VN",
      timestamp: BigInt(Date.now()),
      uploaded: false,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
