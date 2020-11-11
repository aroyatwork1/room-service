import express from 'express';
import jwt from 'jsonwebtoken';

const secret: string = 'TestDevelopment';

export interface reqWithUser extends express.Request {
  user: {
    boxId: string,
    scopes: string[],
  }
}

/**
 * This function is used by tsoa, as a middleware to all controller routes decorated with the @Security() decorator.
 * The security Decorator calls this function.
 * @param request Request object of the ExpressJs passed by the middleware.
 * @param securityName The used security scheme, passed by the first parameter in the @Security decorator.
 * @param requiredScopes Scopes required in the token. passed by the second parameter in the @security decorator.
 */
// tsoa assumes regular export as part of it generating the routes.
// eslint-disable-next-line import/prefer-default-export
export function expressAuthentication(request: express.Request, securityName: string, requiredScopes: string[]) {
  return new Promise((resolve, reject) => {
    if (securityName === 'basic') {
      // authorization: bearer <token>
      const token = request.headers.authorization?.split(' ')[1] || '';
      jwt.verify(token, secret, (err: any, decoded: any) => {
        if (err) {
          reject(err);
        } else {
          // Check if JWT contains all required scopes
          requiredScopes.forEach((requiredScope) => {
            let notInScope: boolean = true;
            try {
              notInScope = !decoded.scopes.includes(requiredScope);
            } catch {
              reject(Error('No scopes found in the token.'));
            } finally {
              if (notInScope) {
                reject(Error('Token not authorized to access this Api call'));
              }
            }
          });
          resolve(decoded);
        }
      });
    } else {
      reject(Error(`securityType: "${securityName}" not configured`));
    }
  });
}
