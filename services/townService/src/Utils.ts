import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';

/**
 * This function exists solely to help satisfy the linter + typechecker when it looks over the
 * stubbed (not yet implemented by you) functions. Remove calls to it as you go.
 *
 * @param _args
 */
// eslint-disable-next-line
export function removeThisFunctionCallWhenYouImplementThis(_args1?: any, _args2?: any): Error {
  return new Error('Unimplemented');
}

// eslint-disable-next-line
export function logError(err: any): void {
  // eslint-disable-next-line no-console
  console.trace(err);
}

export function getEmailForRequest(req: Request): string {
  const tokenKey = 'https://example.com/email';
  const { authorization } = req.headers;
  const token = authorization && typeof authorization === 'string' && authorization.split(' ')[1];
  if (!token) {
    throw new Error('bad token');
  }
  const decoded = jwt.decode(token) as any;
  if (!decoded[tokenKey]) {
    throw new Error('bad token');
  }

  return (decoded as any)[tokenKey];
}
