import crypto from "crypto";
import prisma from "../lib/prisma";
import ApiError from "../utils/ApiError";

export type PartnerRegistrationStatus = "PENDING" | "APPROVED" | "REJECTED";

interface PartnerRegistrationRow {
  id: string;
  requested_by: string;
  shop_name: string;
  shop_address: string;
  note: string | null;
  status: string;
  decision_note: string | null;
  reviewed_by: string | null;
  reviewed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface PartnerRegistrationItem {
  id: string;
  requestedBy: string;
  shopName: string;
  shopAddress: string;
  note: string | null;
  status: PartnerRegistrationStatus;
  decisionNote: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const BASE_SELECT = `
  SELECT
    id,
    requested_by,
    shop_name,
    shop_address,
    note,
    status,
    decision_note,
    reviewed_by,
    reviewed_at,
    created_at,
    updated_at
  FROM partner_registration_requests
`;

function toTrimmed(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function toStatus(value: unknown): PartnerRegistrationStatus {
  const normalized = toTrimmed(value).toUpperCase();
  if (
    normalized === "PENDING" ||
    normalized === "APPROVED" ||
    normalized === "REJECTED"
  ) {
    return normalized;
  }

  throw new ApiError(400, "status phải là PENDING, APPROVED hoặc REJECTED.");
}

function mapRowToItem(row: PartnerRegistrationRow): PartnerRegistrationItem {
  return {
    id: row.id,
    requestedBy: row.requested_by,
    shopName: row.shop_name,
    shopAddress: row.shop_address,
    note: row.note,
    status: toStatus(row.status),
    decisionNote: row.decision_note,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at ? row.reviewed_at.toISOString() : null,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

async function assertUserExists(userId: string): Promise<void> {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id::text AS id
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;

  if (!rows[0]) {
    throw new ApiError(404, "Không tìm thấy user.");
  }
}

export async function createPartnerRegistrationRequest(input: {
  requestedBy: string;
  shopName: string;
  shopAddress: string;
  note?: string;
}): Promise<PartnerRegistrationItem> {
  const requestedBy = toTrimmed(input.requestedBy);
  const shopName = toTrimmed(input.shopName);
  const shopAddress = toTrimmed(input.shopAddress);
  const note = toTrimmed(input.note);

  if (!requestedBy) {
    throw new ApiError(400, "Thiếu requestedBy hợp lệ.");
  }

  if (!shopName) {
    throw new ApiError(400, "shopName không được để trống.");
  }

  if (!shopAddress) {
    throw new ApiError(400, "shopAddress không được để trống.");
  }

  if (shopName.length > 200) {
    throw new ApiError(400, "shopName tối đa 200 ký tự.");
  }

  if (shopAddress.length > 500) {
    throw new ApiError(400, "shopAddress tối đa 500 ký tự.");
  }

  if (note.length > 1000) {
    throw new ApiError(400, "note tối đa 1000 ký tự.");
  }

  await assertUserExists(requestedBy);

  const roleRows = await prisma.$queryRaw<Array<{ role: string }>>`
    SELECT role::text AS role
    FROM users
    WHERE id = ${requestedBy}
    LIMIT 1
  `;

  const currentRole = toTrimmed(roleRows[0]?.role).toUpperCase();
  if (currentRole === "PARTNER" || currentRole === "ADMIN") {
    throw new ApiError(
      409,
      "Tài khoản đã là PARTNER/ADMIN, không cần đăng ký thêm.",
    );
  }

  const pendingRows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id::text AS id
    FROM partner_registration_requests
    WHERE requested_by = ${requestedBy}
      AND status = 'PENDING'::"ApprovalStatus"
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (pendingRows[0]) {
    throw new ApiError(
      409,
      "Bạn đã có yêu cầu đăng ký đối tác đang chờ duyệt.",
    );
  }

  const createdId = crypto.randomUUID();
  await prisma.$executeRaw`
    INSERT INTO partner_registration_requests (
      id,
      requested_by,
      shop_name,
      shop_address,
      note,
      status,
      updated_at
    ) VALUES (
      ${createdId},
      ${requestedBy},
      ${shopName},
      ${shopAddress},
      ${note || null},
      'PENDING'::"ApprovalStatus",
      NOW()
    )
  `;

  const rows = await prisma.$queryRaw<Array<PartnerRegistrationRow>>`
    SELECT
      id,
      requested_by,
      shop_name,
      shop_address,
      note,
      status,
      decision_note,
      reviewed_by,
      reviewed_at,
      created_at,
      updated_at
    FROM partner_registration_requests
    WHERE id = ${createdId}
    LIMIT 1
  `;

  if (!rows[0]) {
    throw new ApiError(500, "Không thể tạo yêu cầu đăng ký đối tác.");
  }

  return mapRowToItem(rows[0]);
}

export async function listPartnerRegistrationRequestsByRequester(
  requestedBy: string,
): Promise<PartnerRegistrationItem[]> {
  const normalizedRequestedBy = toTrimmed(requestedBy);
  if (!normalizedRequestedBy) {
    throw new ApiError(400, "Thiếu requestedBy hợp lệ.");
  }

  const rows = await prisma.$queryRawUnsafe<Array<PartnerRegistrationRow>>(
    `${BASE_SELECT}
     WHERE requested_by = $1
     ORDER BY created_at DESC
     LIMIT 100`,
    normalizedRequestedBy,
  );

  return rows.map(mapRowToItem);
}

export async function getLatestPartnerRegistrationRequestByRequester(
  requestedBy: string,
): Promise<PartnerRegistrationItem | null> {
  const normalizedRequestedBy = toTrimmed(requestedBy);
  if (!normalizedRequestedBy) {
    throw new ApiError(400, "Thiếu requestedBy hợp lệ.");
  }

  const rows = await prisma.$queryRawUnsafe<Array<PartnerRegistrationRow>>(
    `${BASE_SELECT}
     WHERE requested_by = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    normalizedRequestedBy,
  );

  return rows[0] ? mapRowToItem(rows[0]) : null;
}

export async function listPartnerRegistrationRequests(filters?: {
  status?: string;
}): Promise<PartnerRegistrationItem[]> {
  const status = filters?.status ? toStatus(filters.status) : undefined;

  const rows = status
    ? await prisma.$queryRawUnsafe<Array<PartnerRegistrationRow>>(
        `${BASE_SELECT}
         WHERE status = $1::"ApprovalStatus"
         ORDER BY created_at DESC
         LIMIT 300`,
        status,
      )
    : await prisma.$queryRawUnsafe<Array<PartnerRegistrationRow>>(
        `${BASE_SELECT}
         ORDER BY created_at DESC
         LIMIT 300`,
      );

  return rows.map(mapRowToItem);
}

export async function getPartnerRegistrationRequestById(
  requestId: string,
): Promise<PartnerRegistrationItem> {
  const normalizedRequestId = toTrimmed(requestId);
  if (!normalizedRequestId) {
    throw new ApiError(400, "Thiếu requestId hợp lệ.");
  }

  const rows = await prisma.$queryRawUnsafe<Array<PartnerRegistrationRow>>(
    `${BASE_SELECT}
     WHERE id = $1
     LIMIT 1`,
    normalizedRequestId,
  );

  if (!rows[0]) {
    throw new ApiError(404, "Không tìm thấy yêu cầu đăng ký đối tác.");
  }

  return mapRowToItem(rows[0]);
}

export async function reviewPartnerRegistrationRequest(input: {
  requestId: string;
  reviewerId: string;
  action: "APPROVE" | "REJECT";
  decisionNote?: string;
}): Promise<PartnerRegistrationItem> {
  const requestId = toTrimmed(input.requestId);
  const reviewerId = toTrimmed(input.reviewerId);
  const decisionNote = toTrimmed(input.decisionNote);

  if (!requestId || !reviewerId) {
    throw new ApiError(400, "Thiếu requestId hoặc reviewerId hợp lệ.");
  }

  const nextStatus: PartnerRegistrationStatus =
    input.action === "APPROVE" ? "APPROVED" : "REJECTED";

  const rows = await prisma.$queryRawUnsafe<Array<PartnerRegistrationRow>>(
    `${BASE_SELECT}
     WHERE id = $1
     LIMIT 1`,
    requestId,
  );

  if (!rows[0]) {
    throw new ApiError(404, "Không tìm thấy yêu cầu đăng ký đối tác.");
  }

  const current = mapRowToItem(rows[0]);
  if (current.status !== "PENDING") {
    throw new ApiError(409, "Yêu cầu đã được xử lý trước đó.");
  }

  await prisma.$executeRaw`
    UPDATE partner_registration_requests
    SET
      status = ${nextStatus}::"ApprovalStatus",
      reviewed_by = ${reviewerId},
      reviewed_at = NOW(),
      decision_note = ${decisionNote || null},
      updated_at = NOW()
    WHERE id = ${requestId}
  `;

  return getPartnerRegistrationRequestById(requestId);
}
