//Create Demo-Device-Calendar app programmatically
const request = require('request');

const APP_ID='7c64069a-dd17-40dd-bf16-58da7f753776'; //Demo-Calendar-Credential-Manager
const APP_SECRET='vq.y1~yo4-05t2I04grMt~vJVfIG_al7ru'; //Demo-Calendar-Credential-Manager
const TENANT_ID='0173a9ba-a545-477a-88b4-9c8f2a32fc1f'; //Demo-Calendar-Credential-Manager
const SCOPES='https://graph.microsoft.com/.default';
const GRANT_TYPE='client_credentials';

//Fetch access token
let options = {
    form: {
        client_id: APP_ID,
        client_secret: APP_SECRET,
        grant_type: GRANT_TYPE,
        scope: SCOPES,
    }
}

const URL = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;

console.log();
console.log("*******************************************************************");
console.log(URL, JSON.stringify(options));
console.log();      

request.post(URL, options, (error, response) => {
    if (error){
        console.log("Error 1: ", error);
        return;
    }
    if (response != null) {

        const parsed = JSON.parse(response.body);

        if (response.body.includes('error')) {

            if(parsed.error_codes.includes(90002)){

                console.error('Tenant not found.');
                return;
            }

            if(parsed.error_codes.includes(700016)){

                console.error('Application was not found in the directory.');
                return;
            }

            if(parsed.error_codes.includes(7000222)){

                console.error('The provided client secret keys are expired.');
                //TODO - initiate communication with cloud to rotate secret
                return;
            }

            if(parsed.error_codes.includes(7000215)){

                console.error('Invalid client secret is provided.');
                return;
            }

            console.log('Error 2: ', response.body);
            return;
        }

        console.log(parsed);
        console.log("*******************************************************************");
        console.log();

        createMultiTenantApp(parsed.access_token);
    }
});

function createMultiTenantApp(accessToken){
    request.post('https://graph.microsoft.com/v1.0/applications',{
        'body':{
            'displayName': `Demo-Device-Calendar-${Date.now()}`
        },
        json: true,
        'auth': {
            'bearer': accessToken
        },
        headers:{
                'Content-Type': 'application/json'
        }
    }, (error, response)=>{

        console.log(error);
        console.log(response.body);
    });
}