import {
  Controller,
  Get,
  Route,
  Path,
  Security,
  Request,
} from 'tsoa';
import { reqWithUser } from '../expressAuthentication';
import BoxCalendarLink from '../../classes/BoxCalendarLink';
import BoxLinkCollection from '../../services/mongoDb/BoxLinkCollection';
import httpStatusCode from '../httpStatusCode';

export interface dataResponse {
  data: string
}


@Security('basic', ['box'])
@Route('Boxes')
// generated routes expect a non default export to be present.
// eslint-disable-next-line import/prefer-default-export
export class BoxesPath extends Controller {
  /**
   * @summary Retrieves the box Access token from the calendar service.
   * @param boxId Box id injected by the PathDecorator
   * @param req request object that include userInfo provided by expressAuthentication.
   */
  @Get('{boxId}/AccessToken')
  public async getBoxAccessToken(@Path('boxId') boxId: string, @Request() req: reqWithUser): Promise<dataResponse> {
    let accessToken = '';
    const tokenBoxIdMatchesPath = (boxId === req.user.boxId);
    if (tokenBoxIdMatchesPath) {
      const boxLink = await BoxLinkCollection.findBoxLink(boxId);
      const boxCalendarLink = new BoxCalendarLink(boxLink.boxId, boxLink.calendarId, boxLink.refreshToken);
      accessToken = await boxCalendarLink.generateAccessToken();
    }
    return new Promise((resolve, reject) => {
      if (!tokenBoxIdMatchesPath) {
        this.setStatus(httpStatusCode.UNAUTHORIZED);
        reject(Error('Unauthorized to access different box resource than your own.'));
      } else if (accessToken) {
        this.setStatus(httpStatusCode.OK);
        resolve({ data: accessToken } as dataResponse);
      } else {
        this.setStatus(httpStatusCode.NOT_FOUND);
        reject(Error('Requested data not found'));
      }
    });
  }

  /**
   * @summary Retrieves the box CalendarId from the calendar service.
   * @param boxId Box id injected by the PathDecorator
   * @param req request object that include userInfo provided by expressAuthentication.
   */
  @Get('{boxId}/CalendarId')
  public async getBoxCalendarId(@Path('boxId') boxId: string, @Request() req: reqWithUser): Promise<dataResponse> {
    const tokenBoxIdMatchesPath = (boxId === req.user.boxId);
    let boxLink: BoxCalendarLink;
    if (tokenBoxIdMatchesPath) {
      boxLink = await BoxLinkCollection.findBoxLink(boxId);
    }
    return new Promise((resolve, reject) => {
      if (!tokenBoxIdMatchesPath) {
        this.setStatus(httpStatusCode.UNAUTHORIZED);
        reject(Error('Unauthorized to access different box resource than your own.'));
      } else if (boxLink.calendarId) {
        this.setStatus(httpStatusCode.OK);
        resolve({ data: boxLink.calendarId } as dataResponse);
      } else {
        this.setStatus(httpStatusCode.NOT_FOUND);
        reject(Error('Requested data not found'));
      }
    });
  }
}
