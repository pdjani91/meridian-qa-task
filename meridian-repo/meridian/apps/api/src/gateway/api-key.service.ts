import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { DbService } from '../db/db.service';

export interface ResolvedKey {
  keyId: string; tenantId: string; prefix: string; plan: string;
  timezone: string; suspended: boolean; customRateLimit: number | null;
}

@Injectable()
export class ApiKeyService {
  constructor(private readonly db: DbService) {}

  async resolve(rawKey: string): Promise<ResolvedKey | null> {
    const [prefix, secret] = String(rawKey).split('.');
    if (!prefix || !secret) return null;
    const hash = createHash('sha256').update(secret).digest('hex');

    // BUG FIX SUP-1051: Removed memory cache to avoid revoked keys from working.
    const row = await this.db.one(
      `SELECT k.id, k.tenant_id, k.prefix, t.plan, t.timezone, t.suspended, t.custom_rate_limit
         FROM api_keys k JOIN tenants t ON t.id = k.tenant_id
        WHERE k.prefix = $1 AND k.secret_hash = $2 AND k.revoked_at IS NULL`,
      [prefix, hash],
    );

    return row ? {
      keyId: row.id, tenantId: row.tenant_id, prefix: row.prefix, plan: row.plan,
      timezone: row.timezone, suspended: row.suspended, customRateLimit: row.custom_rate_limit
    } : null;
  }
}