const request = require('request');

const APP_ID='e247bfc1-536c-4e58-8c02-5da65ac9cb01';
const APP_SECRET='34cX_c_9tFyGSWl2JtucSUiVf159PG_-_E';
const TENANT_ID='41677d10-add6-4069-828e-2aa6a1afbcbd';
const SCOPES='https://graph.microsoft.com/.default';
const GRANT_TYPE='client_credentials';
const CALENDER_ID='NOIConferenceRoomA@oneroom.io';

// Fetch access token
let options = {
    form: {
        client_id: APP_ID,
        client_secret: APP_SECRET,
        grant_type: GRANT_TYPE,
        scope: SCOPES
    }
}

const URL = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;

console.log();
console.log("*******************************************************************");
console.log(URL, JSON.stringify(options));
console.log();      

request.post(URL, options, (error, response) => {
    // console.log(error)
    // console.log(response)
    if (error){
        console.log("Error 1: ", error);
        return;
    }
    if (response != null) {

        const parsed = JSON.parse(response.body);
        // console.log(parsed);

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

        readCalender(parsed.access_token);
    }
});

function readCalender(accessToken){
    // accessToken='eyJ0eXAiOiJKV1QiLCJub25jZSI6IkY4VUU4aGpkY3JxWGFBZTNESmhsbDhXYl9GWXk1TlhIanJWY0RYRnI2aXciLCJhbGciOiJSUzI1NiIsIng1dCI6ImtnMkxZczJUMENUaklmajRydDZKSXluZW4zOCIsImtpZCI6ImtnMkxZczJUMENUaklmajRydDZKSXluZW4zOCJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC80MTY3N2QxMC1hZGQ2LTQwNjktODI4ZS0yYWE2YTFhZmJjYmQvIiwiaWF0IjoxNjA1NzYyMTgxLCJuYmYiOjE2MDU3NjIxODEsImV4cCI6MTYwNTc2NjA4MSwiYWlvIjoiRTJSZ1lKakMyZmx0NGR2VGtuYlB4V2RrVGMzUEJRQT0iLCJhcHBfZGlzcGxheW5hbWUiOiJyb29tLXNlcnZpY2UiLCJhcHBpZCI6IjcxZjkzZGJkLTBkMDgtNGQ1ZC05NzQ3LTI0Yjc1MTk5NDM5MCIsImFwcGlkYWNyIjoiMSIsImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzQxNjc3ZDEwLWFkZDYtNDA2OS04MjhlLTJhYTZhMWFmYmNiZC8iLCJpZHR5cCI6ImFwcCIsIm9pZCI6Ijg5ZjUyNTcwLTJmZDMtNGY2MC1iNDg2LTU5ODU3NGQ1N2U0OSIsInJoIjoiMC5BUndBRUgxblFkYXRhVUNDamlxbW9hLTh2YjA5LVhFSURWMU5sMGNrdDFHWlE1QWNBQUEuIiwicm9sZXMiOlsiUGxhY2UuUmVhZC5BbGwiLCJBcHBsaWNhdGlvbi5SZWFkV3JpdGUuT3duZWRCeSIsIkNhbGVuZGFycy5SZWFkIiwiQXBwbGljYXRpb24uUmVhZFdyaXRlLkFsbCIsIkRpcmVjdG9yeS5SZWFkV3JpdGUuQWxsIiwiVXNlci5SZWFkLkFsbCIsIk9yZ2FuaXphdGlvbi5SZWFkV3JpdGUuQWxsIiwiQXBwUm9sZUFzc2lnbm1lbnQuUmVhZFdyaXRlLkFsbCJdLCJzdWIiOiI4OWY1MjU3MC0yZmQzLTRmNjAtYjQ4Ni01OTg1NzRkNTdlNDkiLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiTkEiLCJ0aWQiOiI0MTY3N2QxMC1hZGQ2LTQwNjktODI4ZS0yYWE2YTFhZmJjYmQiLCJ1dGkiOiIyTkpUM1BwdXUwLUFrNzZfdU41MUFBIiwidmVyIjoiMS4wIiwieG1zX3RjZHQiOjE0ODAzNzIxOTN9.r_qnrrdZBH68j8N6dOMe3nxNlRphEPry27AyBxloZ3q-u0H1Mwlbwtvkw9E7H-lNkSunt2yxVRtiA_7lIeB9sDsODjCTY3y7wTRBBMKN8GqZrn8LidTNYQGNXN8nVc570falue5yJXqiSFldEZM8WtuFWP1iSdSCwueHGTAaz_LnTkK8Op74KpF_5P7WHebJT9D6QDLPdPv1jtRn1dNCV8aDD8NAdRlPlz4HdtF0xMHox0QE6_ZVhJDJfkzIfsFTJKbTN1pzd-4JJ9fENTBQBPwvIwdC7cgP3LCQylvIEGwrpVtd1OnO4WjaJ0geJOFFjUTfl8128r6C2Fa0Z4Wi8A';
    const URL = `https://graph.microsoft.com/v1.0/users/${CALENDER_ID}/events`;
    request.get(URL,{
        'auth': {
            'bearer': accessToken
        }
    }, (error, response)=>{

        if(error){

            console.log("Error 3: ", error);
            return;
        }
        
        if (response != null) {

            const parsed = JSON.parse(response.body);
    
            if (response.body.includes('error')) {
    
                if(parsed.error.code == "InvalidAuthenticationToken"){
    
                    console.error('Access token has expired.'); 
                    //TODO regenerate access token in BU side only
                    return;
                }

                console.log('Error 4: ', response.body);
                return;
            }

            console.log(parsed);
            console.log("*******************************************************************");
            console.log();
        }
    });
}