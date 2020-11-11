import assert from 'assert';
import sinon from 'sinon';
import BoxCalendarLink from '../../classes/BoxCalendarLink';
import BoxLinkCollection from '../../services/mongoDb/BoxLinkCollection';
import { ConfigurationsPath } from './ConfigurationsPath.Controller';

const sandbox = sinon.createSandbox();

const mockBoxId = 'mockBoxId';
const mockCalendarId = 'mockCalendarId';
const mockRefreshToken = '123456789012345678901234567890';// min length 20
const mockCensoredRefreshToken = '***12345678901234567890';


const mockDatabaseContent = [
  new BoxCalendarLink(mockBoxId, mockCalendarId, mockRefreshToken),
];

describe('ManagementApi-ConfigurationsPath', () => {
  afterEach(() => {
    sandbox.restore();
  });
  describe('#getAllCalendarLinks', () => {
    it('retrieves all calendarBoxLinks from database and censors out the refresh-token', async () => {
      // given
      sandbox.stub(BoxLinkCollection, 'findAllBoxLinks').resolves(mockDatabaseContent);

      // when
      const allCalendarLinks = await ConfigurationsPath.prototype.getAllCalendarLinks();

      // then
      const CheckCalendarLink = new BoxCalendarLink(mockBoxId, mockCalendarId, mockCensoredRefreshToken);
      assert.deepStrictEqual(allCalendarLinks[0], CheckCalendarLink);
    });
    it('rejects when the findAllBoxLinks query returns a falsely response', (done) => {
      // given
      sandbox.stub(BoxLinkCollection, 'findAllBoxLinks').resolves(undefined);

      // when
      ConfigurationsPath.prototype.getAllCalendarLinks().catch((err) => {
        // then
        assert.ok(err);
        done();
      });
    });
  });
  describe('#getCalendarLink', () => {
    it('retrieves a specific from the database and sensors out the refreshToken', async () => {
      // given
      sandbox.stub(BoxLinkCollection, 'findBoxLink').resolves(mockDatabaseContent[0]);

      // when
      const calendarLink = await ConfigurationsPath.prototype.getCalendarLink(mockBoxId);

      // then
      const CheckCalendarLink = new BoxCalendarLink(mockBoxId, mockCalendarId, mockCensoredRefreshToken);
      assert.deepStrictEqual(calendarLink, CheckCalendarLink);
    });
    it('rejects when the getCalendarLink query returns a falsely response', (done) => {
      // given
      sandbox.stub(BoxLinkCollection, 'findBoxLink').resolves(undefined);

      // when
      ConfigurationsPath.prototype.getCalendarLink(mockBoxId).catch((err) => {
        // then
        assert.ok(err);
        done();
      });
    });
  });
  describe('#delCalendarLink', () => {
    it('successfully queries the database to delete the boxLink.', async () => {
      // given
      const expectedResult = 'deleted 1 records.';
      sandbox.stub(BoxLinkCollection, 'deleteBoxLink').resolves(1);

      // when
      const result = await ConfigurationsPath.prototype.deleteCalendarLink(mockBoxId);

      // then
      assert.deepStrictEqual(result, expectedResult);
    });
    it('rejects queries to the database, when it fails to execute the delete action', (done) => {
      // given
      sandbox.stub(BoxLinkCollection, 'deleteBoxLink').rejects(Error('fail'));

      // when
      ConfigurationsPath.prototype.deleteCalendarLink(mockBoxId).catch((err) => {
        // then
        assert.ok(err);
        done();
      });
    });
  });
  describe('#putCalendarLink', () => {
    it('successfully adds or updates the boxLink.', async () => {
      // given
      const expectedResult = 'ok';
      sandbox.stub(BoxLinkCollection, 'saveBoxLink').resolves();

      // when
      const result = await ConfigurationsPath.prototype.putCalendarLink(
        mockBoxId,
        { calendarId: mockCalendarId, refreshToken: mockRefreshToken },
      );

      // then
      assert.deepStrictEqual(result, expectedResult);
    });
  });
});
