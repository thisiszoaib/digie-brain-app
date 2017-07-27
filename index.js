'use strict';

const express = require('express');
const restService = express();
const bodyParser = require('body-parser');
const nodeCache = require('node-cache');
const myCache = new nodeCache();

let alexaVerifier = require('alexa-verifier');


// var Promise = require('bluebird');
// const request = Promise.promisifyAll(require('request'), { multiArgs: true });

// const apiai = require('apiai');
// const app = apiai('3c6d861ecce14afc8c47ca3371db4fb0');

// const builder = require('botbuilder');


// const processStatementUrl = 'https://mydigie.com/php/processStatement.php';

// var optionsAuthenticate = {
//   url: 'https://mydigie.com/php/authenticateUser.php',
//   headers: {
//     'Cookie': 'testing123',
//     'Connection': 'keep-alive',
//     'Content-Type': 'application/x-www-form-urlencoded'
//   },
//   method: 'POST',
//   body: 'Username=testuser4&Password=techlogix',
//   rejectUnauthorized: false
// };

restService.use(bodyParser.urlencoded({
  extended: true
}));

restService.use(bodyParser.json({
    verify: function getRawBody(req, res, buf) {
        req.rawBody = buf.toString();
    }
}));

restService.get('/', (req, res) => {
  res.send('Hello World.')
});

function requestVerifier(req, res, next) {
    alexaVerifier(
        req.headers.signaturecertchainurl,
        req.headers.signature,
        req.rawBody,
        function verificationCallback(err) {
            if (err) {
                res.status(401).json({ message: 'Verification Failure', error: err });
            } else {
                next();
            }
        }
    );
}

restService.post('/alexa',requestVerifier, (req, res) => {
    if (req.body.request.type === 'IntentRequest') {
    let speech = req.body.request.intent.slots.speech.value;
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": true,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>Repeating <break time=\"1s\"/>" + speech + "</speak>"
        }
      }
    });
  }
});

// var connector = new builder.ChatConnector({
//   appId:process.env.MICROSOFT_APP_ID,
//   appPassword: process.env.MICROSOFT_APP_PASSWORD
// });

// var connector = new builder.ChatConnector({
//   appId:null,
//   appPassword: null
// });

// var bot = new builder.UniversalBot(connector,(session) => 
// {
//     session.send("You said: %s",session.message.text);
//     session.send("Sending another message in 5 seconds...");

//     setTimeout(()=>{ session.send("This is a message after five seconds."); },5000);

// });

// restService.post('/api/messages',connector.listen());

// restService.post('/processStatement', (req, res) => {
//   let isStatementThere = req.body.result && req.body.result.parameters && req.body.result.parameters.statement;

//   if (isStatementThere) {

//     let statement = req.body.result.parameters.statement;

//     let apiAiSessionId = req.body.sessionId;

//     setTimeout(doApiAiEventRequest.bind(null,apiAiSessionId),10000);

//     let digieSessionId = myCache.get(apiAiSessionId);

//     if (digieSessionId === undefined) {

//       request.postAsync(optionsAuthenticate)

//         .then((response) => {
//           let authenticationResponse = response[1].replace(/[\n\r\t]/g, ' ').trim();

//           let separatedResponse = authenticationResponse.split("-");
//           let sessionId = separatedResponse[0].substring(13).trim();

//           myCache.set(apiAiSessionId, sessionId);

//           return getOptionsObject(sessionId,statement);
//         })
//         .then((requestOptions) => {

//           return request.postAsync(requestOptions);

//         }
//         )
//         .then((response) => {

//           let speech = response[1].replace(/[\n\r\t]/g, ' ').trim().substring(15);

//           res.json({
//             speech: speech,
//             displayText: speech,
//             source: 'digie-brain-app'
//           });
//         })
//         .catch(error => console.log(error));

//     } else {
//       console.log("using existing authentication " + apiAiSessionId);

//       request.postAsync(getOptionsObject(digieSessionId,statement))
//         .then((response) => {

//           let speech = response[1].replace(/[\n\r\t]/g, ' ').trim().substring(15);

//           res.json({
//             speech: speech,
//             displayText: speech,
//             source: 'digie-brain-app'
//           });
//         })
//         .catch(error => {
//           console.log(error);
//           res.json({
//             speech: 'There was a technical error.',
//             displayText: 'There was a technical error.',
//             source: 'digie-brain-app'
//           });
//         });
//     }


//   } else {
//     res.json({
//       speech: 'Please say something. Couldnt get that',
//       displayText: 'Please say something. Couldnt get that',
//       source: 'digie-brain-app'
//     });
//   }

  

// });

restService.listen((process.env.PORT || 80), function () {
  console.log('Server started.');
})

// function getOptionsObject(sessionId,statement)
// {
//   return {
//         url: processStatementUrl,
//         headers: {
//           'Cookie': 'PHPSESSID=' + sessionId,
//           'Connection': 'keep-alive',
//           'Content-Type': 'application/x-www-form-urlencoded'
//         },
//         method: 'POST',
//         body: 'SessionID=' + sessionId + '&Language=English&DBName=myDigie&Statement=' + statement,
//         rejectUnauthorized: false
//       };
// }

// function doApiAiEventRequest(currentSessionId)
// {

//   let eventObject = {
//       name : "digie_message",
//       data : {
//         message:"Node App sent this after timer"
//       }
//   };

//   let eventRequest = app.eventRequest(eventObject,{sessionId:currentSessionId});

//   eventRequest.on('response',response => console.log(response));

//   eventRequest.on('error',error => console.log(error));

//   eventRequest.end();

//   console.log("Event Request Sent. " + currentSessionId);
// }