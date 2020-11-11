import sinon from 'sinon';
import assert from 'assert';
import { MongoClient } from 'mongodb';
import BoxLinkCollection from './BoxLinkCollection';
import BoxCalendarLink from '../../classes/BoxCalendarLink';

const sandbox = sinon.createSandbox();
const fakeBoxEntry = { boxId: 'testBoxId', calendarId: 'testCalendarId', refreshToken: 'testRefreshToken' };
const fakeFindOne = sandbox.stub().resolves(fakeBoxEntry);
const fakeUpdateOne = sandbox.stub().resolves();
const fakeDatabaseContents = [
  new BoxCalendarLink(fakeBoxEntry.boxId, fakeBoxEntry.calendarId, fakeBoxEntry.refreshToken),
];
const fakeFind = sandbox.stub().returns({
  map: () => ({
    async toArray() { return fakeDatabaseContents; },
  }),
});
const fakeDeleteOne = sandbox.stub().resolves({ deletedCount: 1, result: { ok: true } });
const fakeCollection = {
  findOne: fakeFindOne,
  updateOne: fakeUpdateOne,
  find: fakeFind,
  deleteOne: fakeDeleteOne,
};
const fakeDB = { collection: () => fakeCollection };
const fakeIsConnected = sandbox.stub().returns(true);
const fakeMongoClient = { db: () => fakeDB, close: () => { }, isConnected: fakeIsConnected };


describe('BoxLinkCollection', () => {
  before(() => {
    sandbox.stub(MongoClient, 'connect').yields(null, fakeMongoClient);
    process.env.MONGODB_URI = 'test uri';
    process.env.MONGODB_DATABASE = 'test db';
  });
  afterEach(async () => {
    sandbox.resetHistory();
    process.env.MONGODB_URI = 'test uri';
    process.env.MONGODB_DATABASE = 'test db';
    await BoxLinkCollection.closeMongoDbConnection();
  });

  it('resolve retrieveBoxLink successfully with a BoxCalendarLink object', async () => {
    const boxLinkTest = await BoxLinkCollection.findBoxLink(fakeBoxEntry.boxId);
    assert.equal(fakeFindOne.callCount, 1);
    assert.strictEqual(boxLinkTest.boxId, fakeBoxEntry.boxId);
  });

  it('resolve retrieveBoxLink successfully with a BoxCalendarLink object', async () => {
    const boxLinkTest = await BoxLinkCollection.findBoxLink('boxIdFind');
    assert.equal(fakeFindOne.callCount, 1);
    assert.strictEqual(boxLinkTest.boxId, fakeBoxEntry.boxId);
  });

  it('resolve updateOrCreateBoxLink successfully', async () => {
    const boxCalendarLink = new BoxCalendarLink('boxId', 'calendarId', 'refreshToken');
    await BoxLinkCollection.saveBoxLink(boxCalendarLink);
    assert.equal(fakeUpdateOne.callCount, 1);
  });

  it('reject updateOrCreateBoxLink without a connection string and database name', async () => {
    delete process.env.MONGODB_URI;
    delete process.env.MONGODB_DATABASE;
    const boxCalendarLink = new BoxCalendarLink('boxId', 'calendarId', 'refreshToken');
    await BoxLinkCollection.saveBoxLink(boxCalendarLink)
      .then(() => assert.fail('findBoxLink succeeded even though the configuration was wrong'))
      .catch((err: Error) => {
        assert.strictEqual(err.message, 'invalid mongoDb configuration');
      });
  });

  it('reject fakeFindOne without a connection string and database name', async () => {
    delete process.env.MONGODB_URI;
    delete process.env.MONGODB_DATABASE;
    await BoxLinkCollection.findBoxLink(fakeBoxEntry.boxId)
      .then(() => assert.fail('findBoxLink succeeded even though the configuration was wrong'))
      .catch((err: Error) => {
        assert.strictEqual(err.message, 'invalid mongoDb configuration');
      });
  });
  describe('#findAllBoxLinks', () => {
    it('resolves an array of BoxCalendarLinks', async () => {
      // When
      const result = await BoxLinkCollection.findAllBoxLinks();

      // Then
      assert.deepStrictEqual(result[0], fakeDatabaseContents[0]);
    });
  });
  describe('#deleteCalendarLink', () => {
    it('resolves the number of records deleted when successful', async () => {
      // when
      const result = await BoxLinkCollection.deleteBoxLink(fakeBoxEntry.boxId);

      // then
      assert.strictEqual(result, 1);
    });
  });
});
