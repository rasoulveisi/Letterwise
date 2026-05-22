export interface AuthenticatedUser {
  readonly id: string;
  readonly email?: string;
}

export interface AuthenticatedRequest {
  readonly headers: Record<string, string | string[] | undefined>;
  user?: AuthenticatedUser;
}

export interface JwtVerifier {
  verify(token: string): Promise<AuthenticatedUser>;
}

export const JWT_VERIFIER = Symbol('JWT_VERIFIER');
