import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "./prisma";

const SESSION_TTL_HOURS = 12;
const SALT_ROUNDS = 12;

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createSessionToken() {
  return crypto.randomBytes(48).toString("base64url");
}

export function sessionExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_TTL_HOURS);
  return expiresAt;
}

export async function validateAdminToken(token: string) {
  if (!token) return null;
  const session = await prisma.adminSession.findUnique({
    where: { token },
    include: { admin: true }
  });

  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.adminSession.delete({ where: { id: session.id } });
    return null;
  }

  // extend session with sliding expiration
  const newExpiry = sessionExpiryDate();
  await prisma.adminSession.update({
    where: { id: session.id },
    data: { expiresAt: newExpiry }
  });

  return session.admin;
}
