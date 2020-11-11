import proxyquire from 'proxyquire';
import assert from 'assert';
import sinon from 'sinon';
import { MsTokenPair } from '../../helpers/RequestGraphTokens';

const sandbox = sinon.createSandbox();

const mockMsOauthCode = '1234';
const mockMsAccessToken = 'mock access token';
const mockMsRefreshToken = 'mock refresh token';
const mockTokenPair = {
  accessToken: mockMsAccessToken,
  refreshToken: mockMsRefreshToken,
} as MsTokenPair;
const mockTokenRequest = sandbox.mock().resolves(mockTokenPair);

const mockSaveBoxLink = sandbox.mock().resolves();
const mockBoxLinkCollection = {
  saveBoxLink: mockSaveBoxLink,
};

const { RootPath } = proxyquire('./RootPath.Controller.ts', {
  '../../helpers/RequestGraphTokens': { default: mockTokenRequest },
  '../../services/mongoDb/BoxLinkCollection': { default: mockBoxLinkCollection },
});

describe('ManagementApi-rootPathController', () => {
  beforeEach(() => {
    sandbox.resetHistory();
  });

  afterEach(() => {
    mockTokenRequest.resolves(mockTokenPair);
  });

  describe('MicrosoftTokens', () => {
    it('resolves the token pair', async () => {
      const pathController = new RootPath();
      const result: MsTokenPair = await pathController.MicrosoftTokens(mockMsOauthCode);
      assert.strictEqual(JSON.stringify(result), JSON.stringify(mockTokenPair));
    });
  });

  describe('saveCalendarConfiguration', () => {
    it('saves to the database when a valid boxId is in the post body', async () => {
      const pathController = new RootPath();
      const postBody = {
        boxId: 'test id',
      };
      await pathController.saveCalendarConfiguration(postBody);
      assert.strictEqual(mockSaveBoxLink.callCount, 1);
    });

    it('rejects when no boxId is in the post body', (done) => {
      const pathController = new RootPath();
      const postBody = {
        badPostBody: 'value',
      };
      pathController.saveCalendarConfiguration(postBody).catch((error: Error) => {
        assert.ok(error);
        done();
      });
    });
  });
});
