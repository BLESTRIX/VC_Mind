import type { AuthContext } from '../auth.js';
import { assertApplicationAccess, requireRoles } from '../auth.js';
import { createApplicationSchema, type CreateApplicationInput } from './application.schemas.js';
import { ApplicationRepository } from './application.repository.js';

export class ApplicationService {
  constructor(private readonly repository = new ApplicationRepository()) {}

  async create(raw: unknown, auth: AuthContext) {
    requireRoles(auth, ['admin', 'investment_manager']);
    const input: CreateApplicationInput = createApplicationSchema.parse(raw);
    return { applicationId: await this.repository.create(input, auth.userId) };
  }

  async remove(applicationId: string, auth: AuthContext): Promise<void> {
    requireRoles(auth, ['admin', 'investment_manager']);
    await assertApplicationAccess(auth, applicationId);
    await this.repository.remove(applicationId);
  }
}
