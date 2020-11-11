import assert from 'assert';
import sinon from 'sinon';
import BoxCalendarLink from '../../classes/BoxCalendarLink';
import BoxLinkCollection from '../../services/mongoDb/BoxLinkCollection';
import { BoxesPath } from './BoxesPath.Controller';
import { reqWithUser } from '../expressAuthentication';

const sandbox = sinon.createSandbox();
const mockBoxId = 'mock box ID';
const mockCalendarId = 'mock calendar ID';
const mockRefreshToken = 'mock Refresh Token';
const mockAccessTokenGenerated = 'mock AccessToken';
const mockError = Error('error message');
const errorMessage = 'Requested data not found';
const unauthorizedMessage = 'Unauthorized to access different box resource than your own.';
const mockReqWithUser = { user: { boxId: mockBoxId, scopes: ['testScope'] } } as reqWithUser;

describe('UserApi/boxes', () => {
  afterEach(() => {
    sandbox.restore();
  });

  describe('/{boxId}/AccessToken', () => {
    it('resolves an AccessToken when available.', async () => {
      // Given
      const mockBoxCalendarLink = new BoxCalendarLink(mockBoxId, mockCalendarId, mockRefreshToken);
      sandbox.stub(BoxLinkCollection, 'findBoxLink').resolves(mockBoxCalendarLink);
      sandbox.stub(BoxCalendarLink.prototype, 'generateAccessToken').resolves(mockAccessTokenGenerated);

      // When
      const resultingAccessToken = await BoxesPath.prototype.getBoxAccessToken(mockBoxId, mockReqWithUser);

      // Then
      assert.strictEqual(resultingAccessToken.data, mockAccessTokenGenerated);
    });

    it('rejects with an error when a boxCalendarLink does not contain a AccessToken.', (done) => {
      // Given
      const mockBoxCalendarLink = new BoxCalendarLink(mockBoxId, mockCalendarId, mockRefreshToken);
      sandbox.stub(BoxLinkCollection, 'findBoxLink').resolves(mockBoxCalendarLink);
      sandbox.stub(BoxCalendarLink.prototype, 'generateAccessToken').resolves('');

      // When
      BoxesPath.prototype.getBoxAccessToken(mockBoxId, mockReqWithUser).catch((err) => {
        // Then
        assert.strictEqual(err.message, errorMessage);
        done();
      });
    });

    it('rejects with an error when an boxCalendarLink is not available.', (done) => {
      // Given
      sandbox.stub(BoxLinkCollection, 'findBoxLink').rejects(mockError);
      sandbox.stub(BoxCalendarLink.prototype, 'generateAccessToken').rejects(mockError);

      // When
      BoxesPath.prototype.getBoxAccessToken(mockBoxId, mockReqWithUser).catch((err: Error) => {
        // Then
        assert.strictEqual(err.message, mockError.message);
        done();
      });
    });

    it('rejects with an error when the requested boxId does not match token boxId.', (done) => {
      // Given
      const mockBadReqWithUser = { user: { boxId: 'badBoxId', scopes: ['testScope'] } } as reqWithUser;

      // When
      BoxesPath.prototype.getBoxAccessToken(mockBoxId, mockBadReqWithUser).catch((err: Error) => {
        // Then
        assert.strictEqual(err.message, unauthorizedMessage);
        done();
      });
    });
  });

  describe('/{boxId}/CalendarId', () => {
    it('resolves a calendarId when available', async () => {
      // Given
      const mockBoxCalendarLink = new BoxCalendarLink(mockBoxId, mockCalendarId, mockRefreshToken);
      sandbox.stub(BoxLinkCollection, 'findBoxLink').resolves(mockBoxCalendarLink);

      // When
      const result = await BoxesPath.prototype.getBoxCalendarId(mockBoxId, mockReqWithUser);

      // Then
      assert.strictEqual(result.data, mockCalendarId);
    });

    it('rejects with an error when a boxCalendarLink does not contain a CalendarId.', (done) => {
      // Given
      const mockBoxCalendarLink = new BoxCalendarLink(mockBoxId, '', mockRefreshToken);
      sandbox.stub(BoxLinkCollection, 'findBoxLink').resolves(mockBoxCalendarLink);

      // When
      BoxesPath.prototype.getBoxCalendarId(mockBoxId, mockReqWithUser).catch((err) => {
        // Then
        assert.strictEqual(err.message, errorMessage);
        done();
      });
    });

    it('rejects with an error when a boxCalendarLink is not available.', (done) => {
      // Given
      sandbox.stub(BoxLinkCollection, 'findBoxLink').rejects(mockError);

      // When
      BoxesPath.prototype.getBoxCalendarId(mockBoxId, mockReqWithUser).catch((err) => {
        // Then
        assert.strictEqual(err.message, mockError.message);
        done();
      });
    });

    it('rejects with an error when the requested boxId does not match token boxId.', (done) => {
      // Given
      const mockBadReqWithUser = { user: { boxId: 'badBoxId', scopes: ['testScope'] } } as reqWithUser;

      // When
      BoxesPath.prototype.getBoxCalendarId(mockBoxId, mockBadReqWithUser).catch((err: Error) => {
        // Then
        assert.strictEqual(err.message, unauthorizedMessage);
        done();
      });
    });
  });
});
