# O365 Calendar integration

## Cloud side code
* [index.html](https://github.com/aroyatwork1/room-service/blob/master/src/public/index.html): It renders UI page for end user
* [index.ts](https://github.com/aroyatwork1/room-service/blob/master/src/public/index.ts): It executes the flow of code, (Fetching access token, Tenant Info, Calendars, Create AD, Service Principal and Secret)

## Device side code
* [BU_ReadCalendar.js](https://github.com/aroyatwork1/room-service/blob/master/sampleNodeApps/BU_ReadCalendar.js): Fetch token for AD, Read Calendar and Handle different kind of errors.
