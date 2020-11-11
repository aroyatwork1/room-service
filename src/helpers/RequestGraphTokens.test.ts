import assert from 'assert';
import sinon from 'sinon';
import request from 'request';
import CodeExchange from './RequestGraphTokens';

const sandbox = sinon.createSandbox();

describe('TokenRequest', () => {
  afterEach(() => {
    sandbox.restore();
  });
  it('checks if exchange code for access token function works', async () => {
    sandbox.stub(request, 'post').yields(null,
      { body: '{ "access_token": "successToken", "refresh_token": "successRefresh" }' });

    const result = await CodeExchange('test', 'false', '');

    assert.equal(JSON.stringify(result), '{"access_token":"successToken","refresh_token":"successRefresh"}');
  });
});
