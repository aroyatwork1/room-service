// /* eslint-disable @typescript-eslint/no-use-before-define */
// const clientId = '7c64069a-dd17-40dd-bf16-58da7f753776';
// const AppName = 'Demo-Calendar-Credential-Manager';
// const scopes = 'https://graph.microsoft.com/.default';
// const deviceCalendarAppId = '13a4446e-4c13-424d-8ecf-370b216c0ef4';
// const signInButton = document.getElementById('signIn') as HTMLButtonElement;
// const signOutButton = document.getElementById('signOut') as HTMLButtonElement;
// const form = document.getElementById('form-id') as HTMLFormElement;
// const dropdown = document.getElementById('calendars') as HTMLSelectElement;
// const boxIdInput = document.getElementById('box-id') as HTMLInputElement;
// const goodResponse = document.getElementById('goodResponse') as HTMLDivElement;
// const badResponse = document.getElementById('badResponse') as HTMLDivElement;
// const table = document.getElementById('alreadyConfiguredLinks') as HTMLTableElement;
// form.hidden = true;
// goodResponse.hidden = true;
// badResponse.hidden = true;

// interface msGraphTokens {
//   access_token: string,
//   refresh_token: string,
// }

// let tokens: msGraphTokens;
// let organizationInfo: any;
// let createdApplication: any;
// let clientCredentail: any;
// let deviceCalendarServicePrincipal: any;
// let consentedAppInfo: any;
// let consentedServicePrincipal: any;
// let servicePrincipalSecret: any;

// async function sleep(seconds: number): Promise<any> {
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             resolve();
//         }, seconds * 1000);
//     });
// }

// async function getGraphCode() {
    
//     console.log("Function: getGraphCode");
//     const url = new URL(window.location.href);
//     const code = url.searchParams.get('code');
//     const admin_consent = url.searchParams.get('admin_consent');
//     const tenant = url.searchParams.get('tenant');
//     let client_credentail_token = null;
    
//     // If user is request a OAUTH sign in, just return from here
//     if (!code && !admin_consent) return;

//     // If code is not found in retuned URL, client credentail flow must have been used; try to get token directly from backend
//     if (!code && admin_consent && tenant) {
//         await getTokenForClientCredentailFlow(tenant || 'organizations');
//         if (tokens && tokens.access_token) client_credentail_token = tokens.access_token;
//     }

//     if (code || client_credentail_token) {

//         console.log(code || client_credentail_token);

//         if (code && !client_credentail_token) await exchangeCodeForToken(code);

//         //////// Extra API calls for testing purpose //////
//         // Get Organization information of the signed in user's AD
//         await getOrganizationInformation(tokens);

//         // // Get list of Azure AD Applications that are registered in the signed in user's AD
//         // await getAllRegisteredADApplications(tokens);

//         // Get The consented Barco App
//         // await getConsentedBarcoApplication(tokens);

//         // Get The ServicePrincipal of the consented Barco App
//         await getConsentedBarcoApplicationServicePrincipal(tokens);

//         // Add secret to the Selected Service Principal
//         // await addSecretToServicePrincipal(tokens, consentedServicePrincipal.id);

//         // // Create a Device Azure AD app in to Client's Azure AD
//         // await createAzureADApp(tokens);

//         // // Sleep for One second
//         // await sleep(1);

//         // // Add Secret Credential to the newly created AD App
//         // await addSecretCredentails(createdApplication.id);
//         // await sleep(1);

//         // // Patch the application object : Is this required ?
//         // // await patchADApplication(createdApplication.id, {tenantId: organizationInfo.id, clientSecret: clientCredentail.secretText});

//         // // Create Service Principal for the Device Calendar application
//         await addServicePrincipal(deviceCalendarAppId);
//         await sleep(1);

//         // Add secret to the Device Calendar Service Principal
//         await addSecretToServicePrincipal(tokens, deviceCalendarServicePrincipal.id);

//         // // Add admin consent to each Resource Access requested on the Device AD app
//         // await addAdminConsent([requiredResourceAccess]);

//         const finalData = {
//             servicePrincipalSecret: servicePrincipalSecret.secretText,
//             tenantId: organizationInfo.value[0].id
//         };
//         console.log("!!! D O N E !!!");
//         console.log();
//         console.dir(finalData);
//     }
// }

// function loginGraph() {
//     console.log("Function: loginGraph");
//     window.location.assign(buildUrl());
// }

// function validateForm(event: Event) {
//     console.log("Function: validateForm");
// }

// function buildUrl() {
//     console.log("Function: buildUrl");
//     // const base_url = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'; // For user code grant flow
//     const base_url = 'https://login.microsoftonline.com/common/adminconsent'; // For client credential flow
//     const url = base_url
//         + `?client_id=${clientId}`
//         + '&response_type=code'
//         + `&redirect_uri=${window.location.href}`
//         + '&response_mode=query'
//         + `&scope=${scopes}`
//         + `&state=${55555}`;
//     return url;
// }

// async function getTokenForClientCredentailFlow(tenant: string) {

//     console.log("Function: getTokenForClientCredentailFlow");
//     return new Promise((resolve, reject) => {
//         signInButton.disabled = true;
//         // Post to backend where the call to graph will happen
//         const xhr = new XMLHttpRequest();
//         xhr.open('GET', `/api/v1.0/MicrosoftTokens?client_credentail=true&code=blank&&tenant=${tenant}`, true);
//         xhr.send();

//         xhr.onreadystatechange = () => {
//             if (xhr.readyState === XMLHttpRequest.DONE) {
//             tokens = JSON.parse(xhr.responseText) as msGraphTokens;
//             console.dir(tokens.access_token);
//             callUrlWithToken(
//                 new URL('https://graph.microsoft.com/v1.0/places/microsoft.graph.room?$top=200&$count=true'),
//                 tokens.access_token,
//                 graphAPICallbackCalendar,
//                 resolve
//             );
//             }
//             signOutButton.disabled = false;
//         };
//     });
// }

// // 5) Call a url with an access token and return data and give data to 6)
// function callUrlWithToken(url: URL, accessToken: string, callback: Function, resolver?: any, postBody?: any, method?: string) {

//     // console.log("Function: callUrlWithToken");
//     const xmlHttp = new XMLHttpRequest();
//     xmlHttp.onreadystatechange = () => {
//         if (xmlHttp.readyState === 4 && (xmlHttp.status === 200 || xmlHttp.status === 201 || xmlHttp.status === 204)) {
//             callback(JSON.parse(xmlHttp.responseText));
//             if(resolver) resolver();
//         }
//     };
//     let verb = (postBody) ? 'POST' : 'GET';
//     if (method) verb = method;
//     xmlHttp.open(verb, url.toString(), true); // true for asynchronous
//     if (verb == 'POST' || verb == 'PATCH') xmlHttp.setRequestHeader('Content-Type', 'application/json');
//     xmlHttp.setRequestHeader('Authorization', `Bearer ${accessToken}`);
//     xmlHttp.send(JSON.stringify(postBody));
// }

// function graphAPICallbackCalendar(data: any) {

//     console.log("Function: graphAPICallbackCalendar")
//     console.dir(data);
//     data.value.forEach((element: any) => {
//         const calendar = document.createElement('option');
//         calendar.value = element.id;
//         calendar.text = element.name || element.displayName;
//         if (element.emailAddress) {
//             calendar.text = calendar.text + ` ( ${element.emailAddress} )`
//         }
//         dropdown.appendChild(calendar);
//     });
//     form.hidden = false;
// }

// async function exchangeCodeForToken(code: string) {

//     console.log("Function: exchangeCodeForToken");
//     return new Promise((resolve, reject) => {
//         signInButton.disabled = true;
//         // Post to backend where the call to graph will happen
//         const xhr = new XMLHttpRequest();
//         xhr.open('GET', `/api/v1.0/MicrosoftTokens?code=${code}`, true);
//         xhr.send();

//         xhr.onreadystatechange = () => {
//             if (xhr.readyState === XMLHttpRequest.DONE) {
//             tokens = JSON.parse(xhr.responseText) as msGraphTokens;
//             console.dir(tokens);
//             callUrlWithToken(
//                 // new URL('https://graph.microsoft.com/v1.0/me/calendars?$top=200'),
//                 new URL('https://graph.microsoft.com/v1.0/places/microsoft.graph.room?$top=200'),
//                 tokens.access_token,
//                 graphAPICallbackCalendar,
//                 resolve
//             );
//             }
//             signOutButton.disabled = false;
//         };
//     });
// }

// async function getOrganizationInformation(tokens: msGraphTokens): Promise<any> {

//     console.log("Function:: getOrganizationInformation")
//     return new Promise((resolve, reject) => {
//         callUrlWithToken(
//             new URL('https://graph.microsoft.com/v1.0/organization'),
//             tokens.access_token,
//             (data: any) => {
//             console.log('*************************************************');
//             console.log('TENANT INFORMATION')
//             console.dir(data);
//             organizationInfo = data;
//             console.log('*************************************************');
//             resolve();
//             },
//         );
//     });
// }

// async function getConsentedBarcoApplication(tokens: msGraphTokens): Promise<any> {

//     console.log("Function:: getConsentedBarcoApplication")
//     return new Promise((resolve, reject) => {
//         callUrlWithToken(
//             new URL('https://graph.microsoft.com/v1.0/applications?$search="displayName:'+AppName+'"'),
//             tokens.access_token,
//             (data: any) => {
//             console.log('*************************************************');
//             console.log('GET AZURE AD APPLICATION')
            
//             // Remove this code, when the API starts to work correctly and only the searched criteria is met
//             // For the app user, this API should not return the app and the .find shhould return undefined
//             const app = data.value.find((app: any) => {
//                 return app.displayName === AppName;
//             });
//             // Done

//             consentedAppInfo = app || data.value[0];
//             console.dir(consentedAppInfo);
//             console.log('*************************************************');
//             resolve();
//             },
//         );
//     });
// }

// async function getConsentedBarcoApplicationServicePrincipal(tokens: msGraphTokens): Promise<any> {

//     console.log("Function:: getConsentedBarcoApplicationServicePrincipal")
//     return new Promise((resolve, reject) => {
//         callUrlWithToken(
//             new URL("https://graph.microsoft.com/v1.0/servicePrincipals?$filter=startswith(displayName, '"+AppName+"')"),
//             tokens.access_token,
//             (data: any) => {
//             console.log('*************************************************');
//             console.log('GET AZURE AD SERVICEPRINCIPAL');

//             // Remove this code, when the API starts to work correctly and only the searched criteria is met
//             const app = data.value.find((app: any) => {
//                 return app.displayName === AppName;
//             });
//             // Done

//             consentedServicePrincipal = app || data.value[0];
//             console.dir(consentedServicePrincipal);
//             console.log('*************************************************');
//             resolve();
//             },
//         );
//     });
// }

// async function addSecretToServicePrincipal(tokens: msGraphTokens, servicePrincipalId: string): Promise<any> {

//     console.log("Function:: addSecretToServicePrincipal")
//     return new Promise((resolve, reject) => {
//         callUrlWithToken(
//             new URL(`https://graph.microsoft.com/v1.0/servicePrincipals/${servicePrincipalId}/addPassword`),
//             tokens.access_token,
//             (data: any) => {
//                 console.log('*************************************************');
//                 console.log('CREATE SERVICEPRINCIPAL SECRET')
//                 servicePrincipalSecret = data;
//                 console.dir(data);
//                 console.log('*************************************************');
//                 resolve();
//             },
//             null,
//             { 
//                 passwordCredential:{
//                     "displayName": "default-secret-added",
//                     "startDateTime": '2018-01-01T00:00:00Z',
//                     "endDateTime": '2022-01-01T00:00:00Z'
//                 }
//             }
//         );
//     });
// }

// async function addServicePrincipal(appId: string) {

//     console.log("Function:: addServicePrincipal")
//     return new Promise((resolve, reject) => {
//         callUrlWithToken(
//             new URL(`https://graph.microsoft.com/v1.0/serviceprincipals`),
//             tokens.access_token,
//             (data: any) => {
//                 console.log('*************************************************');
//                 console.log('ADD SERVICE PRINCIPLE TO AZURE AD DEVICE APP')
//                 console.dir(data);
//                 deviceCalendarServicePrincipal = data;
//                 console.log('*************************************************');
//                 resolve();
//             },
//             null,
//             { "appId": appId }
//         );
//     });  
// }