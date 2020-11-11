/* eslint-disable @typescript-eslint/no-use-before-define */
const clientId = '71f93dbd-0d08-4d5d-9747-24b751994390';
// const scopes = 'offline_access Calendars.Read Place.Read Place.Read.All Application.ReadWrite.All Directory.AccessAsUser.All User.Read Organization.Read.All Directory.Read.All Organization.ReadWrite.All Directory.ReadWrite.All Organization.Read.All Directory.Read.All Organization.ReadWrite.All Directory.ReadWrite.All';
const scopes = 'User.Read.All Place.Read.All Application.ReadWrite.OwnedBy Directory.ReadWrite.All Organization.ReadWrite.All AppRoleAssignment.ReadWrite.All';
const signInButton = document.getElementById('signIn') as HTMLButtonElement;
const signOutButton = document.getElementById('signOut') as HTMLButtonElement;
const form = document.getElementById('form-id') as HTMLFormElement;
const dropdown = document.getElementById('calendars') as HTMLSelectElement;
const boxIdInput = document.getElementById('box-id') as HTMLInputElement;
const goodResponse = document.getElementById('goodResponse') as HTMLDivElement;
const badResponse = document.getElementById('badResponse') as HTMLDivElement;
const table = document.getElementById('alreadyConfiguredLinks') as HTMLTableElement;
form.hidden = true;
goodResponse.hidden = true;
badResponse.hidden = true;

interface msGraphTokens {
  access_token: string,
  refresh_token: string,
}

let tokens: msGraphTokens;
let organizationInfo: any;
let createdApplication: any;
let clientCredentail: any;
let deviceIdentityServicePrincipal: any;
const requiredResourceAccess = {
  resourceAppId: '00000003-0000-0000-c000-000000000000',
  resourceAccess: [{"id": "798ee544-9d2d-430c-a058-570e29e34338", "type": "Role"},{"id": "df021288-bdef-4463-88db-98f22de89214", "type": "Role"}]
};

// Helper function
async function sleep(seconds: number): Promise<any> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}

// Start section: msGraph login flow and add Calendar
// 1) Build redirect url to redirect to for office365 login
function buildUrl() {
  debugger;
  // const base_url = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'; // For user code grant flow
  const base_url = 'https://login.microsoftonline.com/common/adminconsent'; // For client credential flow
  const url = base_url
    + `?client_id=${clientId}`
    + '&response_type=code'
    + `&redirect_uri=${window.location.href}`
    + '&response_mode=query'
    + `&scope=${scopes}`
    + `&state=${55555}`;
  return url;
}

// 2) redirect to office365 login for code
function loginGraph() {
  window.location.assign(buildUrl());
}
signInButton.onclick = loginGraph;


// 3) get the code out of the url parameters
async function getGraphCode() {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  const admin_consent = url.searchParams.get('admin_consent');
  const tenant = url.searchParams.get('tenant');
  let client_credentail_token = null;

  // If user is request a OAUTH sign in, just return from here
  if (!code && !admin_consent) return;

  // If code is not found in retuned URL, client credentail flow must have been used; try to get token directly from backend
  if (!code && admin_consent && tenant) {
    await getTokenForClientCredentailFlow(tenant || 'organizations');
    if (tokens && tokens.access_token) client_credentail_token = tokens.access_token;
  }

  if (code || client_credentail_token) {
    console.log(code || client_credentail_token);

    if (code && !client_credentail_token) await exchangeCodeForToken(code);

    //////// Extra API calls for testing purpose //////
    // Get Organization information of the signed in user's AD
    await getOrganizationInformation(tokens);

    // Get list of Azure AD Applications that are registered in the signed in user's AD
    await getAllRegisteredADApplications(tokens);

    // Create a Device Azure AD app in to Client's Azure AD
    await createAzureADApp(tokens);

    // Sleep for One second
    await sleep(1);

    // Add Secret Credential to the newly created AD App
    await addSecretCredentails(createdApplication.id);
    await sleep(1);

    // Patch the application object : Is this required ?
    // await patchADApplication(createdApplication.id, {tenantId: organizationInfo.id, clientSecret: clientCredentail.secretText});

    // Create Service Principal for the Device App registration 
    await addServicePrincipal(createdApplication.appId);
    await sleep(1);

    // Add admin consent to each Resource Access requested on the Device AD app
    await addAdminConsent([requiredResourceAccess]);

    const finalData = {
      displayName: createdApplication.displayName,
      id: createdApplication.id,
      appId: createdApplication.appId,
      tenantId: organizationInfo.value[0].id,
      clientSecret: clientCredentail.secretText,
      createdDateTime: createdApplication.createdDateTime
  };

    console.log("!!! D O N E !!!");
    console.log();
    console.dir(finalData);
  }
}

async function deleteDeviceADApp(id: string) {
  let promise = new Promise((resolve, reject) => {
    callUrlWithToken(
      new URL(`https://graph.microsoft.com/v1.0/applications/${id}`),
      tokens.access_token,
      (data: any) => {
        console.log('*************************************************');
        console.log('DELETE AZURE AD DEVICE APP')
        console.dir(data);
        console.log('*************************************************');
        resolve();
      },
      null,
      null,
      'DELETE'
    );
  });

  promise = promise.then(() => {
    callUrlWithToken(
      new URL(`https://graph.microsoft.com/v1.0/directory/deletedItems/${id}`),
      tokens.access_token,
      (data: any) => {
        console.log('*************************************************');
        console.log('PERMANENTLY DELETE AZURE AD DEVICE APP')
        console.dir(data);
        console.log('*************************************************');
      },
      null,
      null,
      'DELETE'
    );
  });
  
  return promise;
}

async function addAdminConsent(resourceAccessArray: Array<any>): Promise<any> {
  let promise = new Promise((resolve, reject) => {resolve();});

  resourceAccessArray.forEach(async (resource: any) => {
    promise = promise.then(async () => {
      const targetResourceServicePrincipal = await _getTargetResourceServicePricipal(resource.resourceAppId);
      if (!targetResourceServicePrincipal || !targetResourceServicePrincipal.value || !targetResourceServicePrincipal.value.length) {
        await deleteDeviceADApp(createdApplication.id);
        throw Error("Service principal for target resource " + resource.resourceAppId + ' not found !! DELETING DEVICE APP !!');
      }
      await _assignAppRoles(deviceIdentityServicePrincipal.id, targetResourceServicePrincipal.value[0].id, resource.resourceAccess);
    });
  });

  return promise;
}

async function _assignAppRoles(deviceIdentityServicePrincipalId: string, targetResourceServicePrincipalId: string, resourceAccessArray: Array<any>) {
  let promise = new Promise((resolve, reject) => {resolve();});

  resourceAccessArray.forEach(async (item: any) => {
    promise = promise.then(async () => {
      await createAppRoleAssignmentForRequstedResourceAccess(item.id, deviceIdentityServicePrincipalId, targetResourceServicePrincipalId);
    });
  });

  return promise;
}

async function createAppRoleAssignmentForRequstedResourceAccess(appRoleId: string, deviceIdentityServicePrincipalId: string, targetResourceServicePrincipalId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    callUrlWithToken(
      new URL(`https://graph.microsoft.com/v1.0/serviceprincipals/${deviceIdentityServicePrincipalId}/appRoleAssignments`),
      tokens.access_token,
      (data: any) => {
        console.log('\t*************************************************');
        console.log('\tCREATE APP ROLE FOR REQUESTED RESOURCE ' + appRoleId);
        console.dir(data);
        console.log('\t*************************************************');
        resolve();
      },
      null,
      { "appRoleId": appRoleId, "principalId": deviceIdentityServicePrincipalId, "resourceId": targetResourceServicePrincipalId  }
    );
  });  
}

async function _getTargetResourceServicePricipal(resourceAppId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    callUrlWithToken(
      new URL(`https://graph.microsoft.com/v1.0/serviceprincipals?$filter=appId eq '${resourceAppId}'`),
      tokens.access_token,
      (data: any) => {
        console.log('\t*************************************************');
        console.log('\tGET TARGET RESOURCE SERVICE PRINCPAL ' + resourceAppId);
        console.dir(data);
        console.log('\t*************************************************');
        resolve(data);
      },
    );
  });
}

async function addServicePrincipal(appId: string) {
  return new Promise((resolve, reject) => {
    callUrlWithToken(
      new URL(`https://graph.microsoft.com/v1.0/serviceprincipals`),
      tokens.access_token,
      (data: any) => {
        console.log('*************************************************');
        console.log('ADD SERVICE PRINCIPLE TO AZURE AD DEVICE APP')
        console.dir(data);
        deviceIdentityServicePrincipal = data;
        console.log('*************************************************');
        resolve();
      },
      null,
      { "appId": appId }
    );
  });  
}

async function patchADApplication(applicationId: string, patchBody: any): Promise<any> {
  return new Promise((resolve, reject) => {
    callUrlWithToken(
      new URL(`https://graph.microsoft.com/v1.0/applications/${applicationId}`),
      tokens.access_token,
      (data: any) => {
        console.log('*************************************************');
        console.log('PATCH AZURE AD DEVICE APP')
        console.dir(data);
        console.log('*************************************************');
        resolve();
      },
      null,
      patchBody,
      'PATCH'
    );
  });
}

async function addSecretCredentails(applicationId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    callUrlWithToken(
      new URL(`https://graph.microsoft.com/v1.0/applications/${applicationId}/addPassword`),
      tokens.access_token,
      (data: any) => {
        console.log('*************************************************');
        console.log('CREATE PASSWORD FOR AZURE AD DEVICE APP')
        console.dir(data);
        clientCredentail = data;
        console.log('*************************************************');
        resolve();
      },
      null,
      { "displayName": "Default Password"}
    );
  });
}

async function createAzureADApp(tokens: msGraphTokens): Promise<any> {
  const appName = 'NOI-Taurus-Test-' + Date.now();
  const description = `This is a sample description of ${appName} app, which is created for the sole purpose of testing`;
  const signInAudience = 'AzureADMyOrg';
  const deviceIdentity = {
    displayName: appName,
    description,
    signInAudience,
    requiredResourceAccess: [requiredResourceAccess]
  };

  return new Promise((resolve, reject) => {
    callUrlWithToken(
      new URL('https://graph.microsoft.com/v1.0/applications'),
      tokens.access_token,
      (data: any) => {
        console.log('*************************************************');
        console.log('CREATE AZURE AD DEVICE APP')
        console.dir(data);
        createdApplication = data;
        console.log('*************************************************');
        resolve();
      },
      null,
      deviceIdentity
    );
  });
}

async function getOrganizationInformation(tokens: msGraphTokens): Promise<any> {
  return new Promise((resolve, reject) => {
    callUrlWithToken(
      new URL('https://graph.microsoft.com/v1.0/organization'),
      tokens.access_token,
      (data: any) => {
        console.log('*************************************************');
        console.log('TENANT INFORMATION')
        console.dir(data);
        organizationInfo = data;
        console.log('*************************************************');
        resolve();
      },
    );
  });
}

async function getAllRegisteredADApplications(tokens: msGraphTokens): Promise<any> {
  return new Promise((resolve, reject) => {
    callUrlWithToken(
      new URL('https://graph.microsoft.com/v1.0/applications?$top=200'),
      tokens.access_token,
      (data: any) => {
        console.log('*************************************************');
        console.log('AZURE AD APPLICATION LISTING')
        console.dir(data);
        console.log('*************************************************');
        resolve();
      },
    );
  });
}

const body = document.getElementById('body') as HTMLBodyElement;
body.onload = getGraphCode;

// 4) exchange the returned code for an access and refresh token
async function exchangeCodeForToken(code: string) {
  return new Promise((resolve, reject) => {
    signInButton.disabled = true;
    // Post to backend where the call to graph will happen
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/api/v1.0/MicrosoftTokens?code=${code}`, true);
    xhr.send();

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        tokens = JSON.parse(xhr.responseText) as msGraphTokens;
        console.dir(tokens);
        callUrlWithToken(
          // new URL('https://graph.microsoft.com/v1.0/me/calendars?$top=200'),
          new URL('https://graph.microsoft.com/v1.0/places/microsoft.graph.room?$top=200'),
          tokens.access_token,
          graphAPICallbackCalendar,
          resolve
        );
      }
      signOutButton.disabled = false;
    };
  });
}

// ALT 4) Call token endpoint for client credentials flow
async function getTokenForClientCredentailFlow(tenant: string) {
  return new Promise((resolve, reject) => {
    signInButton.disabled = true;
    // Post to backend where the call to graph will happen
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/api/v1.0/MicrosoftTokens?client_credentail=true&code=blank&&tenant=${tenant}`, true);
    xhr.send();

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        tokens = JSON.parse(xhr.responseText) as msGraphTokens;
        console.dir(tokens.access_token);
        callUrlWithToken(
          // new URL('https://graph.microsoft.com/v1.0/me/calendars?$top=200'),
          new URL('https://graph.microsoft.com/v1.0/places/microsoft.graph.room?$top=200&$count=true'),
          tokens.access_token,
          graphAPICallbackCalendar,
          resolve
        );
      }
      signOutButton.disabled = false;
    };
  });
}

// 5) Call a url with an access token and return data and give data to 6)
function callUrlWithToken(url: URL, accessToken: string, callback: Function, resolver?: any, postBody?: any, method?: string) {
  const xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = () => {
    if (xmlHttp.readyState === 4 && (xmlHttp.status === 200 || xmlHttp.status === 201 || xmlHttp.status === 204)) {
      callback(JSON.parse(xmlHttp.responseText));
      if(resolver) resolver();
    }
  };
  let verb = (postBody) ? 'POST' : 'GET';
  if (method) verb = method;
  xmlHttp.open(verb, url.toString(), true); // true for asynchronous
  if (verb == 'POST' || verb == 'PATCH') xmlHttp.setRequestHeader('Content-Type', 'application/json');
  xmlHttp.setRequestHeader('Authorization', `Bearer ${accessToken}`);
  xmlHttp.send(JSON.stringify(postBody));
}

// 6) Place graph data into the dropdown
function graphAPICallbackCalendar(data: any) {
  console.dir(data);
  data.value.forEach((element: any) => {
    const calendar = document.createElement('option');
    calendar.value = element.id;
    calendar.text = element.name || element.displayName;
    if (element.emailAddress) {
      calendar.text = calendar.text + ` ( ${element.emailAddress} )`
    }

    dropdown.appendChild(calendar);
  });
  form.hidden = false;
}

// 7) validate the form and post to save when correct
function validateForm(event: Event) {
  event.preventDefault();
  if (tokens && (tokens.access_token === null || tokens.refresh_token === null)) {
    // eslint-disable-next-line no-console
    console.error('User was not logged in correctly!');
  } else if (form != null) {
    postForm(
      boxIdInput.value,
      dropdown.value,
      tokens.access_token,
      tokens.refresh_token,
    );
  }
}
form.onsubmit = validateForm;

// 8) post the form to save
function postForm(boxId: string, calendarId: string, accessToken: string, refreshToken: string) {
  const formData = {
    boxId,
    calendarId,
    accessToken,
    refreshToken,
  };

  const xmlHttp = new XMLHttpRequest();
  xmlHttp.open('POST', `${window.location.origin}/api/v1.0/saveCalendarConfiguration`, true);
  xmlHttp.setRequestHeader('Content-Type', 'application/json');
  xmlHttp.send(JSON.stringify(formData));

  xmlHttp.onreadystatechange = () => {
    if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
      goodResponse.hidden = false;
      badResponse.hidden = true;
      buildTableWithConfiguredLinks();
    } else {
      goodResponse.hidden = true;
      badResponse.hidden = false;
    }
  };
}
// End section.

// Start section: display currently configured calendar links.

function requestDeleteEntry(boxId: string) {
  return new Promise((resolve, reject) => {
    const theUrl = `${window.location.origin}/api/v1.0/configurations/${boxId}/${window.location.search}`;
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => {
      if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
        const result = JSON.parse(xmlHttp.responseText);
        buildTableWithConfiguredLinks();
        resolve(result);
      } else if (xmlHttp.readyState === 4 && xmlHttp.status !== 200) {
        buildTableWithConfiguredLinks();
        reject();
      }
    };
    xmlHttp.open('DELETE', theUrl, true); // true for asynchronous
    xmlHttp.send(null);
  });
}

function addHeadersToTable(entry: any) {
  table.innerHTML = '';
  let buffer = '<tr>';
  Object.keys(entry).forEach((key) => {
    buffer += `<th>${key}</th>`;
  });
  buffer += '<th>Delete</th>';
  buffer += '</tr>';
  table.innerHTML += buffer;
}

function addConfigurationEntryToTable(entry: any) {
  const { boxId } = entry;
  const deleteButtonId = `${boxId}-delete`;
  let buffer = '<tr>';
  Object.keys(entry).forEach((key) => {
    buffer += `<td>${entry[key]}</td>`;
  });
  buffer += `<th><button type="button" id="${deleteButtonId}">delete</button></th>`;
  buffer += '</tr>';
  table.innerHTML += buffer;
  setTimeout(() => { // Allow main thread to render button before trying to bind an element to it.
    const deleteButton = document.getElementById(deleteButtonId) as HTMLButtonElement;
    deleteButton.onclick = () => {
      if (boxId) { requestDeleteEntry(boxId); }
    };
  }, 0);
}

function getConfigurationLinks(): Promise<Array<any>> {
  return new Promise((resolve, reject) => {
    const theUrl = `${window.location.origin}/api/v1.0/configurations/all${window.location.search}`;
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => {
      if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
        const result = JSON.parse(xmlHttp.responseText);
        resolve(result);
      } else if (xmlHttp.readyState === 4 && xmlHttp.status !== 200) {
        reject();
      }
    };
    xmlHttp.open('GET', theUrl, true); // true for asynchronous
    xmlHttp.send(null);
  });
}

function buildTableWithConfiguredLinks() {
  getConfigurationLinks().then((ConfigLinks: Array<any>) => {
    if (ConfigLinks.length > 0) {
      addHeadersToTable(ConfigLinks[0]);
      ConfigLinks.forEach((entry) => {
        addConfigurationEntryToTable(entry);
      });
    } else {
      table.innerHTML = '';
    }
  });
}

buildTableWithConfiguredLinks();
// End section.
