import assert from 'assert';
import sinon from 'sinon';
import request from 'request';
import BoxCalendarLink from './BoxCalendarLink';

const sandbox = sinon.createSandbox();

describe('BoxCalendarLink', () => {
  afterEach(() => {
    sandbox.restore();
  });
  it('assign values to the constructor', () => {
    const boxCalendarLink = new BoxCalendarLink('boxId', 'calenderId', 'refreshToken');
    assert.equal(boxCalendarLink.boxId, 'boxId');
    assert.equal(boxCalendarLink.calendarId, 'calenderId');
    assert.equal(boxCalendarLink.refreshToken, 'refreshToken');
  });
  it('generates a new access token', async () => {
    // given
    sandbox.stub(request, 'post').yields(null, { body: '{ "access_token": "successToken" }' });

    // when
    const boxCalendarLink = new BoxCalendarLink('boxId', 'calenderId', 'refreshToken');
    const result = await boxCalendarLink.generateAccessToken();

    // then
    assert.equal(result, 'successToken');
  });
  it('returns an error instead of an access token if Microsoft Graph returns an error', async () => {
    // given
    sandbox.stub(request, 'post').yields(Error('error'), null);

    // when
    const boxCalendarLink = new BoxCalendarLink('boxId', 'calenderId', 'refreshToken');
    const promise = boxCalendarLink.generateAccessToken();

    // then
    await assert.rejects(promise, Error('error'));
  });
});
