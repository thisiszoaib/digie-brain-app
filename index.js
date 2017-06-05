const express = require('express');
const restService = express();
const bodyParser = require('body-parser');
const request = require('request');
const nodeCache = require('node-cache');
const myCache = new nodeCache();

var optionsAuthenticate = {
  url: 'https://mydigie.com/php/authenticateUser.php',
  headers: {
    'Cookie': 'testing123',
    'Connection': 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  method: 'POST',
  body: 'Username=testuser4&Password=techlogix',
  rejectUnauthorized: false
};

restService.use(bodyParser.urlencoded({
  extended: true
}));

restService.use(bodyParser.json());

restService.get('/', function (req, res) {
  res.send('Hello World.')
})

restService.post('/processStatement', function (req, res) {
  var isStatementThere = req.body.result && req.body.result.parameters && req.body.result.parameters.statement;

  if (isStatementThere) {

    var statement = req.body.result.parameters.statement;

    var apiAiSessionId = req.body.sessionId;

    var digieSessionId = myCache.get(apiAiSessionId);

    if (digieSessionId == undefined) {
        request(optionsAuthenticate, function (error, response, body) {
        var authenticationResponse = body;
        authenticationResponse = authenticationResponse.replace(/[\n\r\t]/g, ' ');
        authenticationResponse = authenticationResponse.trim();

        var separatedResponse = authenticationResponse.split("-");
        var sessionId = separatedResponse[0].substring(13).trim();

        myCache.set(apiAiSessionId,sessionId);

        var processStatementOptions = {
          url: 'https://mydigie.com/php/processStatement.php',
          headers: {
            'Cookie': 'PHPSESSID=' + sessionId,
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          method: 'POST',
          body: 'SessionID=' + sessionId + '&Language=English&DBName=myDigie&Statement=' + statement,
          rejectUnauthorized: false
        };

        request(processStatementOptions, function (error, response, body) {

          var speech = body.replace(/[\n\r\t]/g, ' ').trim().substring(15);

          return res.json({
            speech: speech,
            displayText: speech,
            source: 'digie-brain-app'
          });
        });
      });
    } else {
      console.log("using existing authentication " + apiAiSessionId);
      var processStatementOptions = {
        url: 'https://mydigie.com/php/processStatement.php',
        headers: {
          'Cookie': 'PHPSESSID=' + digieSessionId,
          'Connection': 'keep-alive',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        body: 'SessionID=' + digieSessionId + '&Language=English&DBName=myDigie&Statement=' + statement,
        rejectUnauthorized: false
      };

      request(processStatementOptions, function (error, response, body) {

        var speech = body.replace(/[\n\r\t]/g, ' ').trim().substring(15);

        return res.json({
          speech: speech,
          displayText: speech,
          source: 'digie-brain-app'
        });
      });
    }


  } else {
    return res.json({
      speech: 'Please say something. Couldnt get that',
      displayText: 'Please say something. Couldnt get that',
      source: 'digie-brain-app'
    });
  }




});

restService.listen((process.env.PORT || 80), function () {
  console.log('Server started.');
})