const request = require('request');

const applicationId = "6b923f4b-f8bd-46e1-a386-4e974695c75a"; //Object ID
const accessToken = "eyJ0eXAiOiJKV1QiLCJub25jZSI6Ijh6ajN3bEplOGF3RkI1NkVycF9IS0t3Tml1QWJWRGVGRmplekktUm5ZdWMiLCJhbGciOiJSUzI1NiIsIng1dCI6ImtnMkxZczJUMENUaklmajRydDZKSXluZW4zOCIsImtpZCI6ImtnMkxZczJUMENUaklmajRydDZKSXluZW4zOCJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC80MTY3N2QxMC1hZGQ2LTQwNjktODI4ZS0yYWE2YTFhZmJjYmQvIiwiaWF0IjoxNjA2MTI1Mjk4LCJuYmYiOjE2MDYxMjUyOTgsImV4cCI6MTYwNjEyOTE5OCwiYWlvIjoiRTJSZ1lEaGk0eVZpd01vUmwvei9zTVE3cVhmekFRPT0iLCJhcHBfZGlzcGxheW5hbWUiOiJyb29tLXNlcnZpY2UiLCJhcHBpZCI6IjcxZjkzZGJkLTBkMDgtNGQ1ZC05NzQ3LTI0Yjc1MTk5NDM5MCIsImFwcGlkYWNyIjoiMSIsImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzQxNjc3ZDEwLWFkZDYtNDA2OS04MjhlLTJhYTZhMWFmYmNiZC8iLCJpZHR5cCI6ImFwcCIsIm9pZCI6ImUzZmEzMzU2LWZhMDktNDljMi04YjJjLWU4NDhhN2VjN2M1NSIsInJoIjoiMC5BUndBRUgxblFkYXRhVUNDamlxbW9hLTh2YjA5LVhFSURWMU5sMGNrdDFHWlE1QWNBQUEuIiwicm9sZXMiOlsiUGxhY2UuUmVhZC5BbGwiLCJBcHBsaWNhdGlvbi5SZWFkV3JpdGUuT3duZWRCeSIsIkNhbGVuZGFycy5SZWFkIiwiVXNlci5SZWFkLkFsbCIsIkFwcFJvbGVBc3NpZ25tZW50LlJlYWRXcml0ZS5BbGwiXSwic3ViIjoiZTNmYTMzNTYtZmEwOS00OWMyLThiMmMtZTg0OGE3ZWM3YzU1IiwidGVuYW50X3JlZ2lvbl9zY29wZSI6Ik5BIiwidGlkIjoiNDE2NzdkMTAtYWRkNi00MDY5LTgyOGUtMmFhNmExYWZiY2JkIiwidXRpIjoiZWcyQzQ0RTBhRVdEaHFJX28tMXBBQSIsInZlciI6IjEuMCIsInhtc190Y2R0IjoxNDgwMzcyMTkzfQ.gKObPXta1WaZt3f6L0HOKWnJ3P09ppyZs4l1IdpU857vEt7emeinYRAtmlwhpFRrMBBUrVVTh5BEcFZT-EAXGZ72PaW2kGSsegle93ZzGZM1Hh-renuOWGei9zzCjP-_Mebc4mTOetEpuO8yWAyvIM9zZfMBKZPox9CvYdHsz6IWWbYnAP6CqMqzajYOTgsj3FzyGRca4WkUI_vSgLn74XRYg6oCBBFRpjyeeJzxFs3tOVQlbKLWsEWsoGLR5SROaFjPDpi1OSsKPxdYBJCPN0Gu-f5PRMEF3XNIF574e4-yKlzx8cYJ0kqamgThQ9nCNoa3HhAWhCiElABEFREbNA";
const currentSecretKeyId = "264a025b-2c2b-4f18-a30c-08016a189b79";

request.post(`https://graph.microsoft.com/v1.0/applications/${applicationId}/addPassword`, {
    body: {
        passwordCredential:{
            "displayName": "default-secret-added",
            "startDateTime": '2018-01-01T00:00:00Z',
            "endDateTime": '2022-01-01T00:00:00Z'
        }
    },
    json: true,
    'auth': {
        'bearer': accessToken
    }
}, (error, response) => {
    if( error || response == null ){
        console.log("Error in adding password / secret");
        return;
    }

    console.log("Adding new secret is success");
    console.log(response.body);

    request.post(`https://graph.microsoft.com/v1.0/applications/${applicationId}/removePassword`, {
        body: {
            keyId: currentSecretKeyId
        },
        json: true,
        'auth': {
            'bearer': accessToken
        }
    }, (error, response) => {
        if( error || response == null ){
            console.log("Error in adding password / secret");
            return;
        }

        console.log("Removing old secret success");
        console.log(response.body);
    })    
})