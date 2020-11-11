import request from 'request';

export interface MsTokenPair {
  accessToken: string;
  refreshToken: string;
}

// const scopes = 'offline_access Calendars.Read Place.Read Place.Read.All Application.ReadWrite.All Directory.AccessAsUser.All User.Read Organization.Read.All Directory.Read.All Organization.ReadWrite.All Directory.ReadWrite.All Organization.Read.All Directory.Read.All Organization.ReadWrite.All Directory.ReadWrite.All';
const scopes = 'https://graph.microsoft.com/.default'; // 'api://71f93dbd-0d08-4d5d-9747-24b751994390' + '/.default'; // For client credentail flow

/**
 * https://docs.microsoft.com/en-us/graph/auth-v2-user#3-get-a-token
 * @param code authorization
 */
export default function requestGraphTokens(code: string, client_credential: string, tenant: string): Promise<MsTokenPair> {
  const grant_type = ( code && (!client_credential || client_credential != 'true')) ? 'authorization_code' : 'client_credentials'; 
  return new Promise<MsTokenPair>((resolve, reject) => {
    try {
      let options: any = {
        form: {
          client_id: process.env.CLIENT_ID,          
          scope: scopes,
          redirect_uri: `http://localhost:${process.env.LOCAL_BROWSER_PORT}/`,
          grant_type: grant_type, // For client credentail flow, need to use 'client_credentials', for user code grant flow use 'authorization_code'
          client_secret: process.env.CLIENT_SECRET
        },
      };
      
      if (code && grant_type == 'authorization_code') {
        options.form.code = code;
      }

      const organization = (grant_type == 'client_credentials') ? tenant : 'organizations';
      const URL = `https://login.microsoftonline.com/${organization}/oauth2/v2.0/token`;

      console.log();
      console.log("*******************************************************************");
      console.log(URL, JSON.stringify(options));
      console.log();      

      request.post(URL, options,
        async (error, response) => {
          if (error) reject(error);
          if (response != null) {
            if (response.body.includes('error')) reject(response.body);
            const parsed = JSON.parse(response.body) as MsTokenPair;
            console.dir(parsed);
            console.log("*******************************************************************");
            console.log();
            resolve(parsed);
          }
        });
    } catch (error) {
      console.dir(error);
      console.log("*******************************************************************");
      console.log();
      reject(error);
    }
  });
}
