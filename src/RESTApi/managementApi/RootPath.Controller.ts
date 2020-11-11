import {
  Controller,
  Get,
  Post,
  Body,
  Route,
  Query,
} from 'tsoa';
import tokenRequest from '../../helpers/RequestGraphTokens';
import BoxCalendarLink from '../../classes/BoxCalendarLink';
import BoxLinkCollection from '../../services/mongoDb/BoxLinkCollection';
import httpStatusCode from '../httpStatusCode';

interface CalendarConfigurationForm {
  boxId: string,
  calendarId: string,
  refreshToken: string
}

@Route('/')
// generated routes expect a non default export to be present.
// eslint-disable-next-line import/prefer-default-export
export class RootPath extends Controller {
  /**
   * @summary Exchanges the code provided by Microsoft for AccessTokens and RefreshTokens.
   * @param code OAuth2 code provided by the msAuthentication flow.
   */
  @Get('MicrosoftTokens')
  public async MicrosoftTokens(@Query() code: string, @Query() client_credentail: string, @Query() tenant: string) {
    const tokens = await tokenRequest(code, client_credentail, tenant);
    this.setStatus(httpStatusCode.OK);
    return tokens;
  }

  /**
   * @summary Save a new Calendar configuration in to the database.
   * @param postData calendar configuration you wish to save.
   */
  @Post('saveCalendarConfiguration')
  public async saveCalendarConfiguration(@Body() postData: CalendarConfigurationForm): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!postData.boxId) {
        this.setStatus(httpStatusCode.BAD_REQUEST);
        reject(Error('No boxId set.'));
      }
      try {
        const calendarConfiguration = new BoxCalendarLink(postData.boxId, postData.calendarId, postData.refreshToken);
        BoxLinkCollection.saveBoxLink(calendarConfiguration).then(() => {
          this.setStatus(httpStatusCode.OK);
          resolve();
        });
      } catch (error) {
        this.setStatus(httpStatusCode.INTERNAL_SERVER_ERROR);
        reject(error);
      }
    });
  }
}
