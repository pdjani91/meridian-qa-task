import { Body, Controller, Get, Patch, Delete, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Actor, RequestActor, Roles } from '../common/decorators';
import { DbService } from '../db/db.service';
import { AuditService } from '../audit/audit.service';
import { planFor, PlanTier } from '../common/plans';

@Controller('tenant')
@UseGuards(JwtGuard, RolesGuard)
export class TenantsController {
  constructor(private readonly db: DbService, private readonly audit: AuditService) {}

  @Get()
  async current(@Actor() actor: RequestActor) {
    const tenant = await this.db.one(
      `SELECT id, name, slug, plan, timezone, suspended, created_at, custom_rate_limit FROM tenants WHERE id = $1`, [actor.tenantId]
    );
    const limits = planFor(tenant.plan as PlanTier);
    if (tenant.custom_rate_limit) limits.rateLimitPerMinute = tenant.custom_rate_limit;
    return { ...tenant, limits };
  }

  @Patch('rate-limit')
  @Roles('OWNER')
  async updateRateLimit(@Actor() actor: RequestActor, @Body() body: { rateLimitPerMinute: number }) {
    if (!body?.rateLimitPerMinute) throw new BadRequestException('rateLimitPerMinute required');
    const tenant = await this.db.one(`SELECT plan FROM tenants WHERE id = $1`, [actor.tenantId]);
    const maxLimit = { FREE: 500, GROWTH: 5000, SCALE: 25000 }[tenant.plan];
    if (body.rateLimitPerMinute > maxLimit) throw new BadRequestException(`Cannot exceed ${maxLimit}`);
    
    await this.db.query(`UPDATE tenants SET custom_rate_limit = $2 WHERE id = $1`, [actor.tenantId, body.rateLimitPerMinute]);
    return { ok: true, rateLimitPerMinute: body.rateLimitPerMinute };
  }

  @Delete('rate-limit')
  @Roles('OWNER')
  async removeRateLimit(@Actor() actor: RequestActor) {
    await this.db.query(`UPDATE tenants SET custom_rate_limit = NULL WHERE id = $1`, [actor.tenantId]);
    return { ok: true };
  }
}