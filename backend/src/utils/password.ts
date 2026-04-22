// src/utils/password.ts
import crypto from 'crypto';

export function generatePassword(): string {
  return crypto.randomBytes(12).toString('base64url');
}
