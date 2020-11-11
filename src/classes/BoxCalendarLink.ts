import request from 'request';

export default class BoxCalendarLink {
  constructor(public boxId: string, public calendarId: string, public refreshToken: string) { }

  /**
   * https://docs.microsoft.com/en-us/graph/auth-v2-user#5-use-the-refresh-token-to-get-a-new-access-token
   */
  generateAccessToken(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (!this.refreshToken) {
        reject(new Error('No refresh token available'));
      }
      const options = {
        form: {
          client_id: process.env.CLIENT_ID,
          redirect_uri: `http://localhost:${process.env.LOCAL_BROWSER_PORT}`,
          scope: 'Calendars.Read',
          grant_type: 'refresh_token',
          client_secret: process.env.CLIENT_SECRET,
          refresh_token: this.refreshToken,
        },
      };
      request.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', options,
        async (error, response) => {
          if (error) reject(error);
          if (response != null) {
            if (response.body.includes('error')) reject(response.body);
            const parsed = JSON.parse(response.body);
            this.refreshToken = parsed.refresh_token;
            resolve(parsed.access_token);
          }
        });
    });
  }
}
