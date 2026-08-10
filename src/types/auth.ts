// ─── User Roles ───────────────────────────────────────────────────────────────
export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MANAGER"
  | "TEACHER"
  | "EDITOR"
  | "STUDENT"
  | "USER";

// ─── Core User Model ──────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  dateOfBirth?: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Session stored in JWT payload ────────────────────────────────────────────
export interface JWTPayload {
  sub: string;          // user id
  email: string;
  role: UserRole;
  name: string;
  iat?: number;
  exp?: number;
}

// ─── Auth Session (decoded, enriched) ────────────────────────────────────────
export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: number;
}

// ─── Input DTOs ───────────────────────────────────────────────────────────────
export interface LoginInput {
  emailOrUsername: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterInput {
  name: string;
  email: string;
  username: string;
  dateOfBirth?: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  agreeToTerms: boolean;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ─── API Response Shapes ─────────────────────────────────────────────────────
export interface AuthResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
}
