# Calendar Service POC

## Table of Content
* [Prerequisites](#Prerequisites)
* [Getting started](#Getting-started)
* [Flow](#Flow)
* [TSOA](#TSOA)
* [API calls](#API-Calls)
* [MongoDB setup](#MongoDB-setup)

<a name="Prerequisites"></a>
## Prerequisites
* [install docker](https://docs.docker.com/install/) 
* [install nodejs](https://nodejs.org/)
* [install MongoDB compass](https://www.mongodb.com/download-center/compass)

<a name="Getting-started"></a>
## Getting started
* run command:
  ```BASH
  npm install
  ````
* run command: 
  ```BASH
  npm start
  ```
* surf to the displayed Url
* set up mongoDB: [MongoDB setup](#MongoDB-setup)


<a name="Flow"></a>
## Flow
Proof of concept that would later be a backend server, but for testing purposes one static frontend file is served.

You sign in with your microsoft account. The access & refresh token become available.
All your calendars are displayed. You enter the box ID.
You can "link the box to a calendar" which will post the calendar resource, refresh token, access token and box id to the backend.
Then the box (with box id) will be linked to the a calendar (with the calendar id). 

<a name="TSOA"></a>
## TSOA

### how it works
Routes are being generated using [tsoa](https://github.com/lukeautry/tsoa#readme).
whenever ```$npm run build``` is called, it will generate swagger spec and routes. For the configured routes is ```tsoaFunction.js``` file.

These functions will crawl the configured folder for all files ending with ```.Controller.ts```. All routes will be bundled in a routes.ts file. 

The routes.ts file exports a function which is used in the setup of the express server. Thus configuring the routes for use, the generated routes are prefixed with the paths ```/api/v1.0``` by default. the swagger file will be mounted on the ```/api/docs``` path.

When adding a route to managementApi for example ```/api/v1.0/<namePath>/```. Just add a new ```<namePath>.Controller.ts```. In this file you can start declaring the route's calls.

TSOA requires experimental decorators of typescript to be enabled. Disabling this will break TSOA route generation..
### 

<a name="API-Calls"></a>
## API calls
Once the project is running you can navigate to ```/api/docs``` to open the swagger ui.
This UI will list all available calls and the schemes.
Do pay mind that the url will try to connect to https and thus does not work when running locally.

### Authentication
For dev purpose we can create a token on https://jwt.io using the debugger

```JSON
// put in the header 
{
  "alg": "HS256",
  "typ": "JWT"
}
```
```JSON
// put in the payload 
{
  "boxId": "1234567890", // 
  "scopes": "box"
}
```
```JSON
// put in the signature
"your-256-bit-secret" => ChimayDevelopment
```

You can then copy the token an use to authenticate the userApi, using ```authorization: bearer <token>``` scheme.

<a name="MongoDB-setup"></a>
## MongoDB setup
For development purposes it is necessary to run a local MongoDB on your dev-machine.
to not pollute the machine the most convenient ways is to run the mongoDb docker.
  * Pull a mongo DB docker image from the docker repo:
    ```BASH 
    $ docker pull mongo 
    ```
  * Spin up an instance of the mongoDB docker:
    ```BASH 
    $ docker run -p 27017:27017 --name local-mongo-service -e MONGO_INITDB_ROOT_USERNAME=mongoadmin -e MONGO_INITDB_ROOT_PASSWORD=mongopassword -d mongo
    ```
  * open MongoDB compass and access the local database with the connection string: `mongodb://mongoadmin:mongopassword@localhost:27017`
