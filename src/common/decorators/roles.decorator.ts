import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Decorator to attach required user roles to controller endpoints.
 * Used by RolesGuard for Role-Based Access Control (RBAC).
 * 
 * @example
 * @Roles(Role.ADMIN, Role.TEACHER)
 * @Get()
 * findAll(...) {}
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
