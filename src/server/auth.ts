import type { FastifyRequest } from 'fastify';
import { AppError } from '../lib/errors.js';
import { getServiceClient, getUserClient } from './supabase.js';
import type { UserRole } from '../types/database.js';
export type AuthContext = { userId: string; role: UserRole; organizationName: string | null; accessToken: string };
declare module 'fastify' { interface FastifyRequest { auth?: AuthContext } }
export async function authenticate(request: FastifyRequest): Promise<AuthContext> {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new AppError('UNAUTHORIZED', 'A valid bearer token is required', 401);
  const token = header.slice(7);
  const { data, error } = await getUserClient(token).auth.getUser(token);
  if (error || !data.user) throw new AppError('UNAUTHORIZED', 'Authentication token is invalid', 401);
  const { data: profile, error: profileError } = await getServiceClient().from('profiles').select('id,role,organization_name').eq('id', data.user.id).single();
  if (profileError || !profile) throw new AppError('FORBIDDEN', 'User profile is missing', 403);
  return { userId: profile.id, role: profile.role, organizationName: profile.organization_name, accessToken: token };
}
export const requireRoles = (auth: AuthContext, roles: UserRole[]): void => { if (!roles.includes(auth.role)) throw new AppError('FORBIDDEN', 'Your role cannot perform this operation', 403); };
export async function assertApplicationAccess(auth: AuthContext, applicationId: string): Promise<void> {
  if (auth.role === 'admin') return;
  const { data } = await getServiceClient().from('applications').select('submitted_by,companies(created_by),thesis_configs(owner_id)').eq('id', applicationId).single();
  if (!data) throw new AppError('NOT_FOUND', 'Application not found', 404);
  const owners = [data.submitted_by, (data.companies as { created_by?: string | null } | null)?.created_by, (data.thesis_configs as { owner_id?: string | null } | null)?.owner_id].filter(Boolean);
  if (owners.includes(auth.userId)) return;
  const { data: profiles } = await getServiceClient().from('profiles').select('organization_name').in('id', owners as string[]);
  if (!auth.organizationName || !profiles?.some((p) => p.organization_name === auth.organizationName)) throw new AppError('FORBIDDEN', 'Application belongs to another organization', 403);
}
