import sinon from 'sinon';
import assert from 'assert';
import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { expressAuthentication } from './expressAuthentication';

const sandbox = sinon.createSandbox();
const mockGoodSecurityName = 'basic';
const mockRequiredScopes = ['validScope'];

const mockTokenExpressRequest = { headers: { authorization: 'bearer validToken' } };

describe('ExpressAuthentication', () => {
  afterEach('restore sinon sandbox', () => {
    sandbox.restore();
  });

  it('rejects if an invalid security name is used', (done) => {
    const mockBadSecurityName = 'non valid security name';

    expressAuthentication(mockTokenExpressRequest as Request, mockBadSecurityName, mockRequiredScopes)
      .catch((err: Error) => {
        assert.ok(err);
        done();
      });
  });

  it('rejects if the token cannot be verified', (done) => {
    const mockVerifyFailedMessage = 'verify failed';

    sandbox.stub(jwt, 'verify').yields(Error(mockVerifyFailedMessage), null);
    expressAuthentication(mockTokenExpressRequest as Request, mockGoodSecurityName, mockRequiredScopes)
      .catch((err: Error) => {
        assert.ok(err);
        done();
      });
  });

  it('rejects if the decoded token does not contain the required scope', (done) => {
    sandbox.stub(jwt, 'verify').yields(null, { scopes: ['badScope'] });
    expressAuthentication(mockTokenExpressRequest as Request, mockGoodSecurityName, mockRequiredScopes)
      .catch((err: Error) => {
        assert.ok(err);
        done();
      });
  });

  it('rejects if the decoded token does not contain the required scope', (done) => {
    sandbox.stub(jwt, 'verify').yields(null, { noScopeField: ['badScope'] });
    expressAuthentication(mockTokenExpressRequest as Request, mockGoodSecurityName, mockRequiredScopes)
      .catch((err: Error) => {
        assert.ok(err);
        done();
      });
  });

  it('resolves if the decoded token contains the required scope', (done) => {
    sandbox.stub(jwt, 'verify').yields(null, { scopes: mockRequiredScopes });
    expressAuthentication(mockTokenExpressRequest as Request, mockGoodSecurityName, mockRequiredScopes)
      .then((decoded) => {
        assert.ok(decoded);
        done();
      });
  });
});
