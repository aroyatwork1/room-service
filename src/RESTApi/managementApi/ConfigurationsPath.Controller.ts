import {
  Controller,
  Get,
  Delete,
  Route,
  Path,
  Put,
  Body,
} from 'tsoa';
import BoxCalendarLink from '../../classes/BoxCalendarLink';
import BoxLinkCollection from '../../services/mongoDb/BoxLinkCollection';
import httpStatusCode from '../httpStatusCode';

function censorString(input: string, visibleLength: number): string {
  return `***${input.substr(input.length - visibleLength)}`;
}

interface CalendarUpdateForm {
  calendarId: string,
  refreshToken: string
}

@Route('configurations')
// generated routes expect a non default export to be present.
// eslint-disable-next-line import/prefer-default-export
export class ConfigurationsPath extends Controller {
  /**
   * @summary Retrieve all box entries in the database.
   */
  @Get('/all')
  public async getAllCalendarLinks(): Promise<BoxCalendarLink[]> {
    const allBoxCalendarLinks = await BoxLinkCollection.findAllBoxLinks();
    if (allBoxCalendarLinks) {
      const censoredBoxLinks = allBoxCalendarLinks.map((link) => {
        const censoredLink = new BoxCalendarLink(link.boxId, link.calendarId, censorString(link.refreshToken, 20));
        return censoredLink;
      });
      this.setStatus(httpStatusCode.OK);
      return censoredBoxLinks;
    }
    this.setStatus(httpStatusCode.SERVICE_UNAVAILABLE);
    throw Error('Failed to retrieve BoxCalendarLinks');
  }

  /**
   * @summary retrieve a specific boxCalendarLink from the database.
   * @param boxId the box of which you wish to retrieve the database entry of.
   */
  @Get('/{boxId}')
  public async getCalendarLink(@Path('boxId') boxId: string): Promise<BoxCalendarLink> {
    const boxCalendarLink = await BoxLinkCollection.findBoxLink(boxId);
    if (boxCalendarLink) {
      boxCalendarLink.refreshToken = censorString(boxCalendarLink.refreshToken, 20);
      this.setStatus(httpStatusCode.OK);
      return (boxCalendarLink);
    }
    this.setStatus(httpStatusCode.SERVICE_UNAVAILABLE);
    throw Error('Failed to retrieve BoxCalendarLink');
  }

  /**
   * @summary Add or update the calendar link of a specific box.
   * @param boxId Box that should be updated.
   * @param postData Calendar information to save.
   */
  @Put('/{boxId}')
  public async putCalendarLink(@Path('boxId') boxId: string, @Body() postData: CalendarUpdateForm): Promise<string> {
    const updatedBoxLink = new BoxCalendarLink(boxId, postData.calendarId, postData.refreshToken);
    await BoxLinkCollection.saveBoxLink(updatedBoxLink).catch((err) => {
      this.setStatus(httpStatusCode.SERVICE_UNAVAILABLE);
      throw err;
    });
    this.setStatus(httpStatusCode.OK);
    return 'ok';
  }

  /**
   * @summary Deletes a given boxId from the collection.
   * @returns the amount of deleted entries
   */
  @Delete('/{boxId}')
  public async deleteCalendarLink(@Path('boxId') boxId: string): Promise<string> {
    const deletedRecords = await BoxLinkCollection.deleteBoxLink(boxId).catch((err) => {
      this.setStatus(httpStatusCode.SERVICE_UNAVAILABLE);
      throw err;
    });
    this.setStatus(httpStatusCode.OK);
    return `deleted ${deletedRecords} records.`;
  }
}
